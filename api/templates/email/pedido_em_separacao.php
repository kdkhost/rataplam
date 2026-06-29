<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#ec4899,#8b5cf6);padding:30px 40px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:24px;">Pedido em Separação</h1>
<p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Seu pedido está sendo preparado</p>
</td></tr>
<tr><td style="padding:30px 40px;">
<p style="color:#333;font-size:16px;margin:0 0 15px;">Olá <strong><?= htmlspecialchars($nome ?? 'Cliente') ?></strong>,</p>
<p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">Boas notícias! Seu pedido <strong>#<?= htmlspecialchars($numero ?? '') ?></strong> está sendo <strong style="color:#f59e0b;">separado e embalado</strong> com cuidado.</p>
<p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">Assim que estiver pronto para envio, você receberá uma notificação com o código de rastreamento.</p>
</td></tr>
<tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;">
<p style="color:#94a3b8;font-size:12px;margin:0;">RATAPLAM - Roupas Infantis com Amor</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>
