import { useCallback, useEffect, useState } from "react";
import HomeIntro from "./components/HomeIntro";
import XRScene from "./scenes/XRScene";
import SliderScene from "./scenes/SliderScene";

function getRoute(pathname) {
  if (pathname === "/slider") {
    return "/slider";
  }

  if (pathname === "/dashboard") {
    return "/dashboard";
  }

  if (pathname === "/home" || pathname === "/") {
    return "/home";
  }

  return "/home";
}

export default function App() {
  const [route, setRoute] = useState(() => getRoute(window.location.pathname));

  useEffect(() => {
    const normalizedRoute = getRoute(window.location.pathname);

    if (normalizedRoute !== window.location.pathname) {
      window.history.replaceState({}, "", normalizedRoute);
    }

    const handlePopState = () => {
      setRoute(getRoute(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((nextRoute, { replace = false } = {}) => {
    const normalizedRoute = getRoute(nextRoute);
    const historyMethod = replace ? "replaceState" : "pushState";

    if (window.location.pathname !== normalizedRoute) {
      window.history[historyMethod]({}, "", normalizedRoute);
    }

    setRoute(normalizedRoute);
  }, []);

  if (route === "/slider") {
    return <SliderScene onBackToDashboard={() => navigate("/dashboard")} />;
  }

  if (route === "/dashboard") {
    return (
      <XRScene
        actions={[
          {
            label: "Open Slider",
            onClick: () => navigate("/slider"),
          },
        ]}
      />
    );
  }

  return <HomeIntro onEnter={() => navigate("/dashboard")} />;
}
