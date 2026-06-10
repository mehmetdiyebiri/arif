import { execSync } from 'child_process';

try {
  console.log("Git Status:");
  console.log(execSync("git status", { encoding: 'utf8' }));
  
  console.log("\nGit Log (Last 10 commits):");
  console.log(execSync("git log -n 10 --oneline", { encoding: 'utf8' }));
  
  console.log("\nSearching commits for 'kitap' or 'okuma':");
  console.log(execSync("git log -S'kitap' --oneline || true", { encoding: 'utf8' }));
  console.log(execSync("git log -S'okuma' --oneline || true", { encoding: 'utf8' }));
  console.log(execSync("git log -S'Emir' --oneline || true", { encoding: 'utf8' }));
} catch (e: any) {
  console.error("Git command failed:", e.message);
}
