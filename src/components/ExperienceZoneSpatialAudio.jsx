import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";

const PANEL_KEYS = [
  "tempHum",
  "tempHumidityChart",
  "humidity",
  "map",
  "voltage",
  "bottom",
];
const PANEL_CHANNEL_PAN = {
  tempHum: -1,
  humidity: -1,
  tempHumidityChart: 1,
  voltage: 1,
  map: 0,
  bottom: 0,
};

export const EXPERIENCE_AUDIO_UNLOCK_EVENT = "experience-audio-unlock";
const AUDIO_FILE = `${import.meta.env.BASE_URL}audio.wav`;
const FADE_IN_SECONDS = 0.24;
const FADE_OUT_SECONDS = 0.22;

export default function ExperienceZoneSpatialAudio({
  enabled = false,
  hoveredPanelKey = null,
  panelRefs,
}) {
  const { camera } = useThree();
  const listenerRef = useRef(null);
  const sourcesRef = useRef({});
  const activeKeyRef = useRef(null);
  const hoveredPanelKeyRef = useRef(hoveredPanelKey);
  const enabledRef = useRef(enabled);
  const [audioBuffer, setAudioBuffer] = useState(null);

  const panelKeys = useMemo(() => PANEL_KEYS, []);

  const stopActivePanel = useCallback(() => {
    const activeKey = activeKeyRef.current;

    if (!activeKey) {
      return;
    }

    fadeOutAndStop(activeKey, sourcesRef.current);
    activeKeyRef.current = null;
  }, []);

  const playHoveredPanel = useCallback((nextPanelKey) => {
    const currentSources = sourcesRef.current;
    const previousKey = activeKeyRef.current;

    if (!nextPanelKey || !currentSources[nextPanelKey]) {
      stopActivePanel();
      return;
    }

    if (previousKey && previousKey !== nextPanelKey) {
      fadeOutAndStop(previousKey, currentSources);
    }

    if (fadeInAndPlay(nextPanelKey, currentSources)) {
      activeKeyRef.current = nextPanelKey;
    }
  }, [stopActivePanel]);

  useEffect(() => {
    hoveredPanelKeyRef.current = hoveredPanelKey;
  }, [hoveredPanelKey]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const listener = new THREE.AudioListener();
    listenerRef.current = listener;
    camera.add(listener);

    let disposed = false;
    const sources = {};

    panelKeys.forEach((panelKey) => {
      const positionalAudio = new THREE.PositionalAudio(listener);
      const stereoPanner = listener.context.createStereoPanner();
      positionalAudio.setLoop(true);
      positionalAudio.setRefDistance(1.8);
      positionalAudio.setRolloffFactor(1.35);
      positionalAudio.setDistanceModel("inverse");
      positionalAudio.setMaxDistance(10);
      positionalAudio.setDirectionalCone(220, 280, 0.1);
      positionalAudio.setVolume(0);

      if (positionalAudio.gain?.gain) {
        positionalAudio.gain.gain.value = 0;
      }

      stereoPanner.pan.value = PANEL_CHANNEL_PAN[panelKey] ?? 0;
      positionalAudio.panner.disconnect();
      positionalAudio.panner.connect(stereoPanner);
      stereoPanner.connect(positionalAudio.gain);

      sources[panelKey] = {
        audio: positionalAudio,
        stereoPanner,
      };
    });

    sourcesRef.current = sources;

    fetch(AUDIO_FILE)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load audio: ${response.status}`);
        }

        return response.arrayBuffer();
      })
      .then((arrayBuffer) => listener.context.decodeAudioData(arrayBuffer.slice(0)))
      .then((decodedBuffer) => {
        if (disposed) {
          return;
        }

        setAudioBuffer(decodedBuffer);
      })
      .catch(() => {});

    return () => {
      disposed = true;
      Object.values(sources).forEach(({ audio, stereoPanner }) => {
        gsap.killTweensOf(audio.gain?.gain);
        if (audio.isPlaying) {
          audio.stop();
        }
        audio.parent?.remove(audio);
        stereoPanner.disconnect();
        audio.disconnect();
      });

      sourcesRef.current = {};
      activeKeyRef.current = null;

      camera.remove(listener);
      listenerRef.current = null;
    };
  }, [camera, panelKeys]);

  useEffect(() => {
    if (!audioBuffer) {
      return;
    }

    Object.values(sourcesRef.current).forEach(({ audio }) => {
      audio.setBuffer(audioBuffer);
    });

    if (enabledRef.current) {
      playHoveredPanel(hoveredPanelKeyRef.current);
    }
  }, [audioBuffer, playHoveredPanel]);

  useEffect(() => {
    const unlockAudio = () => {
      const context = listenerRef.current?.context;
      if (!context) {
        return;
      }

      const resumePromise =
        context.state === "running" ? Promise.resolve() : context.resume();

      resumePromise
        .then(() => {
          if (!enabledRef.current) {
            return;
          }

          playHoveredPanel(hoveredPanelKeyRef.current);
        })
        .catch(() => {});
    };

    window.addEventListener(EXPERIENCE_AUDIO_UNLOCK_EVENT, unlockAudio);
    return () =>
      window.removeEventListener(EXPERIENCE_AUDIO_UNLOCK_EVENT, unlockAudio);
  }, [playHoveredPanel]);

  useFrame(() => {
    if (!panelRefs) {
      return;
    }

    panelKeys.forEach((panelKey) => {
      const panelAnchor = panelRefs[panelKey]?.current;
      const audio = sourcesRef.current[panelKey]?.audio;

      if (!panelAnchor || !audio) {
        return;
      }

      if (audio.parent !== panelAnchor) {
        audio.parent?.remove(audio);
        panelAnchor.add(audio);
      }
    });
  });

  useEffect(() => {
    if (!enabled || !audioBuffer) {
      stopActivePanel();
      return;
    }

    const context = listenerRef.current?.context;
    if (!context) {
      return;
    }

    const resumePromise =
      context.state === "running" ? Promise.resolve() : context.resume();

    resumePromise
      .then(() => {
        if (!enabledRef.current) {
          return;
        }

        playHoveredPanel(hoveredPanelKeyRef.current);
      })
      .catch(() => {});
  }, [audioBuffer, enabled, playHoveredPanel, stopActivePanel]);

  useEffect(() => {
    if (!enabled || !audioBuffer) {
      return;
    }

    const context = listenerRef.current?.context;
    if (context && context.state !== "running") {
      return;
    }

    playHoveredPanel(hoveredPanelKey);
  }, [audioBuffer, enabled, hoveredPanelKey, playHoveredPanel]);

  return null;
}

function fadeInAndPlay(panelKey, sources) {
  const audio = sources[panelKey]?.audio;

  if (!audio?.gain?.gain || !audio.buffer) {
    return false;
  }

  gsap.killTweensOf(audio.gain.gain);

  if (!audio.isPlaying) {
    try {
      audio.play();
    } catch {
      return false;
    }
  }

  audio.gain.gain.value = Math.max(audio.gain.gain.value, 0);
  gsap.to(audio.gain.gain, {
    value: 0.34,
    duration: FADE_IN_SECONDS,
    ease: "power2.out",
  });

  return true;
}

function fadeOutAndStop(panelKey, sources) {
  const audio = sources[panelKey]?.audio;

  if (!audio?.gain?.gain) {
    return;
  }

  gsap.killTweensOf(audio.gain.gain);

  gsap.to(audio.gain.gain, {
    value: 0,
    duration: FADE_OUT_SECONDS,
    ease: "power2.out",
    onComplete: () => {
      if (audio.isPlaying) {
        audio.stop();
      }
      audio.gain.gain.value = 0;
    },
  });
}
