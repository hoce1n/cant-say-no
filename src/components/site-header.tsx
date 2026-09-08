import { Link } from "@tanstack/react-router";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { loadSoundEnabled, saveSoundEnabled } from "@/lib/cards/storage";
import { setSoundEnabled } from "@/lib/cards/audio";
import { cn } from "@/lib/utils";

export function SiteHeader({ className }: { className?: string }) {
  const [sound, setSound] = useState(true);

  useEffect(() => {
    const enabled = loadSoundEnabled();
    setSound(enabled);
    setSoundEnabled(enabled);
  }, []);

  function toggleSound() {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
    saveSoundEnabled(next);
  }

  return (
    <header
      className={cn(
        "relative z-30 flex items-center justify-between gap-3 px-4 py-4 sm:px-6",
        className,
      )}
    >
      <Wordmark />
      <nav className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10"
          aria-pressed={sound}
          aria-label={sound ? "Mute sounds" : "Unmute sounds"}
          onClick={toggleSound}
        >
          {sound ? <Volume2 /> : <VolumeX />}
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to="/">Ask</Link>
        </Button>
        <Button asChild variant="quiet" size="sm">
          <Link to="/create">Create</Link>
        </Button>
      </nav>
    </header>
  );
}
