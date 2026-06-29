<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:32px;text-align:center;">
<h1 style="color:#ffffff;font-size:28px;margin:0;">RATAPLAM</h1>
<p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Contato</p>
</td></tr>
<tr><td style="padding:40px 32px;">
<h2 style="color:#111827;font-size:22px;margin:0 0 16px;">Nova Mensagem de Contato</h2>

<div style="background-color:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
<table width="100%" cellpadding="6" cellspacing="0">
<tr><td style="font-size:14px;color:#6b7280;width:100px;">Nome:</td><td style="font-size:14px;color:#111827;"><?= htmlspecialchars($nome ?? '') ?></td></tr>
<tr><td style="font-size:14px;color:#6b7280;">E-mail:</td><td style="font-size:14px;color:#111827;"><?= htmlspecialchars($email ?? '') ?></td></tr>
<tr><td style="font-size:14px;color:#6b7280;">Assunto:</td><td style="font-size:14px;color:#111827;"><?= htmlspecialchars($assunto ?? '') ?></td></tr>
</table>
</div>

<div style="background-color:#f9fafb;border-radius:12px;padding:20px;">
<p style="font-size:14px;color:#111827;line-height:1.6;margin:0;"><?= nl2br(htmlspecialchars($mensagem ?? '')) ?></p>
</div>
</td></tr>
<tr><td style="background-color:#f9fafb;padding:24px 32px;text-align:center;">
<p style="color:#9ca3af;font-size:13px;margin:0;">&copy; <?= date('Y') ?> RATAPLAM - Roupas Infantis. Todos os direitos reservados.</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>
