<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#ef4444,#f97316);padding:30px 40px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:24px;">Estoque Baixo!</h1>
<p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Produtos precisam de reposição</p>
</td></tr>
<tr><td style="padding:30px 40px;">
<p style="color:#333;font-size:16px;margin:0 0 15px;">Atenção! Os seguintes produtos estão com estoque baixo:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-collapse:collapse;">
<tr style="background:#f8fafc;"><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:bold;color:#475569;font-size:13px;">Produto</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:bold;color:#475569;font-size:13px;text-align:center;">Estoque</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:bold;color:#475569;font-size:13px;text-align:center;">Mínimo</td></tr>
<?php foreach (($produtos ?? []) as $p): ?>
<tr><td style="padding:10px;border-bottom:1px solid #f1f5f9;color:#333;font-size:14px;"><?= htmlspecialchars($p['nome'] ?? '') ?></td><td style="padding:10px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:bold;color:#ef4444;font-size:14px;"><?= $p['estoque'] ?? 0 ?></td><td style="padding:10px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b;font-size:14px;"><?= $p['estoque_minimo'] ?? 0 ?></td></tr>
<?php endforeach; ?>
</table>
</td></tr>
<tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;">
<p style="color:#94a3b8;font-size:12px;margin:0;">RATAPLAM - Painel Administrativo</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>
