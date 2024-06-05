export async function getBunPath(): Promise<string> {
    const command = new Deno.Command('which', {
        args: ['bun'],
        stdout: 'piped',
    });

    const result = await command.output();

    if (!result.success) {
        throw new Error('bun not found');
    }

    const text = new TextDecoder().decode(result.stdout);
    return text.trim();

}