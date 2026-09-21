# IconButton

Uses the shared Button owner. Defaults are **compact (32px)** and **secondary**;
Button itself defaults to **default (44px)** and **primary**. Supply `size` and
`tone` when a composition needs another supported combination; omission is not
an instruction to match Button's defaults.

Micro is 28px. The accessible `label` is required. The icon-only control owns
its square visible geometry; the surrounding composition owns spacing and any
larger touch target. Do not add transparent circles to dense identifier rows
merely to reuse this control: use the reviewed Link/CopyableValue treatment
appropriate to that job.
