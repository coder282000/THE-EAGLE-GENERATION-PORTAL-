# Pending Charter changes

Add these rows to `Eagle_Generation_Portal_Project_Charter_v1.1.pdf` section 32 on the next revision.

| Date | Version | Sections | Change | Decided by |
|------|---------|----------|--------|------------|
| 2026-09-10 | v1.2 | 11, 15, 19 | Member tier naming system locked: Nestling, Rising, Eagle. Maps from application tiers STUDENT->Nestling, PROFESSIONAL->Rising, ASSOCIATE->Eagle. Conversion happens at approval. | Product Lead, Tech Lead |
| 2026-09-10 | v1.2 | 11, 19 | Pillar display casing normalised to Title Case for member-facing surfaces (Marketplace, Governance, Technology). Uppercase retained in Application/DB layer. Conversion at presentation boundary. | Tech Lead |
| 2026-09-10 | v1.2 | 19 | Member.chapter holds a chapter CODE (e.g. 'KU'), not a display name. Display names resolved via getChapterName() helper in lib/mock/members.ts. 16 existing render sites flagged for follow-up migration (docs/follow-ups.md). | Tech Lead |