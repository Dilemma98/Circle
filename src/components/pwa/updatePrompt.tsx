import { useRegisterSW } from "virtual:pwa-register/react";
import "./updatePrompt.css";

export default function UpdatePrompt() {
  const {
  needRefresh: [needRefresh, setNeedRefresh],
  updateServiceWorker,
} = useRegisterSW({
  onRegisteredSW(swUrl, registration) {
    console.log("SW registered:", swUrl);
    console.log("SW registration:", registration);
  },

  onRegisterError(error) {
    console.error("SW registration error:", error);
  },

  onNeedRefresh() {
    console.log("🟣 A new version is available!");
  },

  onOfflineReady() {
    console.log("🟢 Circle is ready to work offline!");
  },
});

  // Hide the update prompt
  const close = () => {
    setNeedRefresh(false);
  };

  // Activate the new version and reload the app
  const update = () => {
    updateServiceWorker(true);
  };

  if (!needRefresh) {
    console.log("No new updates");
    return null
  };

  console.log("Update exists!");

  return (
    <div className="update-prompt" role="alert">
      <div className="update-prompt-content">
        <div className="update-prompt-text">
          <strong>En ny version av Circle 💜</strong>
          <p>Det finns uppdateringar och förbättringar redo.</p>
        </div>

        <div className="update-prompt-actions">
          <button onClick={update} className="update-prompt-button">
            Uppdatera nu
          </button>

          <button onClick={close} className="update-prompt-close">
            Senare
          </button>
        </div>
      </div>
    </div>
  );
}