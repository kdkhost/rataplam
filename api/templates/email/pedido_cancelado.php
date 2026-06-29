<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:32px;text-align:center;">
<h1 style="color:#ffffff;font-size:28px;margin:0;">RATAPLAM</h1>
<p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Pedido Cancelado</p>
</td></tr>
<tr><td style="padding:40px 32px;">
<h2 style="color:#111827;font-size:22px;margin:0 0 16px;">Pedido Cancelado</h2>
<p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
Ol&aacute;, <strong><?= htmlspecialchars($nome ?? 'Cliente') ?></strong>. Seu pedido foi cancelado.
</p>

<div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
<p style="margin:0 0 4px;color:#991b1b;font-size:14px;">Pedido</p>
<p style="margin:0;font-size:20px;font-weight:bold;color:#991b1b;"><?= htmlspecialchars($numero ?? 'N/A') ?></p>
</div>

<p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
Se houve algum pagamento, o reembolso ser&aacute; processado em at&eacute; 5 &uacute;teis dias &uacute;teis.
</p>

<p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0;">
Se tiver alguma d&uacute;vida, entre em contato conosco.
</p>
</td></tr>
<tr><td style="background-color:#f9fafb;padding:24px 32px;text-align:center;">
<p style="color:#9ca3af;font-size:13px;margin:0;">&copy; <?= date('Y') ?> RATAPLAM - Roupas Infantis. Todos os direitos reservados.</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>
