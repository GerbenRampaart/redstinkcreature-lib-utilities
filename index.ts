import { $ } from "bun";
console.log(await $`ls`.text());