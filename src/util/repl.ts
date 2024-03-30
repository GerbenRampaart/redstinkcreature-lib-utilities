import { repl } from "@nestjs/core";
import { LibUtilitiesModule } from "../lib-utilities.module";

async function replTest() {
  await repl(LibUtilitiesModule);
}

replTest();
