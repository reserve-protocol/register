import { Button } from "@/components";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { Play, X } from "lucide-react";

const DTF_VIDEO_ID = "EL9OHjIab_w";

const DTFExplainerButton = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  return (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" className={cn("gap-1 text-legend px-6", className)}>
        <Play className="h-4 w-4" />
        <Trans>Watch DTF Explainer</Trans>
      </Button>
    </DialogTrigger>
    <DialogContent
      className="sm:max-w-[960px] max-w-[95vw] p-0 gap-0 overflow-hidden"
      showClose={false}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <DialogTitle className="text-lg font-semibold">
          <Trans>What is a <span className="text-primary">DTF</span>?</Trans>
        </DialogTitle>
        <DialogClose className="rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring">
          <X className="h-5 w-5" />
          <span className="sr-only"><Trans>Close</Trans></span>
        </DialogClose>
      </div>
      <div className="aspect-[5/3] w-full bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${DTF_VIDEO_ID}?autoplay=1&rel=0`}
          title={t`DTF Explainer`}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </DialogContent>
  </Dialog>
  )
}

export default DTFExplainerButton