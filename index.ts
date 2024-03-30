import { basename, dirname } from "path";

console.log(basename(dirname("foo/bar/baz")));
console.log(basename(dirname("foo/bar/baz/package.json")));
console.log(basename(dirname("package.json")));
console.log(basename(dirname("")));
console.log(basename(dirname("|||@$^#%^&$%^")));
console.log(basename(dirname("|||@$^#%^&$%^")));
