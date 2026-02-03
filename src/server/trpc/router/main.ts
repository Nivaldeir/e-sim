import { router } from "../trpc";
import { userRouter } from "./user";
import { accessRouter } from "./access";
import { companyRouter } from "./company";
import { establishmentRouter } from "./establishment";
import { organizationRouter } from "./organization";
import { documentTemplateRouter } from "./document-template";
import { documentRouter } from "./document";
import { documentGroupRouter } from "./document-group";
import { dashboardRouter } from "./dashboard";
import { socialReasonRouter } from "./social-reason";
import { folderRouter } from "./folder";
import { fileRouter } from "./file";

export const appRouter = router({
  user: userRouter,
  access: accessRouter,
  company: companyRouter,
  establishment: establishmentRouter,
  organization: organizationRouter,
  documentTemplate: documentTemplateRouter,
  document: documentRouter,
  documentGroup: documentGroupRouter,
  dashboard: dashboardRouter,
  socialReason: socialReasonRouter,
  folder: folderRouter,
  file: fileRouter,
});

export type AppRouter = typeof appRouter;