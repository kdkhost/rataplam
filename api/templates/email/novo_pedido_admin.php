<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#ec4899,#8b5cf6);padding:30px 40px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:24px;">Nova Venda!</h1>
<p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Um novo pedido foi realizado</p>
</td></tr>
<tr><td style="padding:30px 40px;">
<p style="color:#333;font-size:16px;margin:0 0 15px;">Um novo pedido foi realizado na loja:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td style="background:#f8fafc;border-radius:8px;padding:20px;">
<p style="color:#333;font-size:15px;margin:0;">Pedido: <strong>#<?= htmlspecialchars($numero ?? '') ?></strong></p>
<p style="color:#333;font-size:15px;margin:8px 0 0;">Cliente: <strong><?= htmlspecialchars($nome ?? '') ?></strong></p>
<p style="color:#333;font-size:15px;margin:8px 0 0;">Total: <strong>R$ <?= number_format((float)($total ?? 0), 2, ',', '.') ?></strong></p>
<p style="color:#333;font-size:15px;margin:8px 0 0;">Pagamento: <strong><?= htmlspecialchars($metodo ?? '') ?></strong></p>
</td></tr></table>
<p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">Acesse o painel administrativo para visualizar os detalhes.</p>
</td></tr>
<tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;">
<p style="color:#94a3b8;font-size:12px;margin:0;">RATAPLAM - Painel Administrativo</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>
