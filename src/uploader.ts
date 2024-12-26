import "source-map-support/register";

import { SendFilesToGitHub } from "./lib/github_store";
import QP from "./lib/sqlParser";

QP.addFile('./SQL/GitHub_Uploader.sql', SendFilesToGitHub);