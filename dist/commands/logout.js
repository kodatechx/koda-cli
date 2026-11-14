import chalk from "chalk";
import { getAuthSession, clearAuthSession } from "../services/auth.js";
import { askConfirmation } from "../ui/terminal.js";
export async function logoutCommand() {
    const session = await getAuthSession();
    if (!session?.email) {
        console.log(chalk.dim("\nAnda memang belum login.\n"));
        return;
    }
    const ok = await askConfirmation(`Yakin ingin keluar dari akun ${session.name} (${session.email})?`);
    if (!ok) {
        console.log(chalk.dim("Dibatalkan."));
        return;
    }
    await clearAuthSession();
    console.log(chalk.green(`\n✓ Berhasil logout. Sesi lokal telah dihapus.\n`));
}
