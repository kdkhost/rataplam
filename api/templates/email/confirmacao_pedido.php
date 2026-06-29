<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:32px;text-align:center;">
<h1 style="color:#ffffff;font-size:28px;margin:0;">RATAPLAM</h1>
<p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Confirma&ccedil;&atilde;o de Pedido</p>
</td></tr>
<tr><td style="padding:40px 32px;">
<h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Pedido Recebido!</h2>
<p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
Ol&aacute;, <strong><?= htmlspecialchars($nome ?? 'Cliente') ?></strong>! Seu pedido foi recebido com sucesso e est&aacute; sendo processado.
</p>

<div style="background-color:#f0f9ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px;">
<p style="margin:0 0 8px;color:#1e40af;font-size:14px;">N&uacute;mero do Pedido</p>
<p style="margin:0;font-size:24px;font-weight:bold;color:#1e40af;"><?= htmlspecialchars($numero ?? 'N/A') ?></p>
</div>

<?php if (!empty($itens)): ?>
<table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom:24px;">
<tr style="background-color:#f9fafb;"><td style="font-size:13px;font-weight:bold;color:#6b7280;">Item</td><td style="font-size:13px;font-weight:bold;color:#6b7280;text-align:center;">Qtd</td><td style="font-size:13px;font-weight:bold;color:#6b7280;text-align:right;">Subtotal</td></tr>
<?php foreach ($itens as $item): ?>
<tr style="border-bottom:1px solid #f3f4f6;">
<td style="font-size:14px;color:#111827;"><?= htmlspecialchars($item['nome'] ?? '') ?></td>
<td style="font-size:14px;color:#6b7280;text-align:center;"><?= (int)($item['quantidade'] ?? 1) ?></td>
<td style="font-size:14px;color:#111827;text-align:right;font-weight:600;">R$ <?= number_format(($item['preco'] ?? 0) * ($item['quantidade'] ?? 1), 2, ',', '.') ?></td>
</tr>
<?php endforeach; ?>
</table>
<?php endif; ?>

<div style="border-top:2px solid #e5e7eb;padding-top:16px;">
<table width="100%" cellpadding="4" cellspacing="0">
<tr><td style="font-size:14px;color:#6b7280;">Subtotal</td><td style="font-size:14px;color:#111827;text-align:right;">R$ <?= number_format((float)($subtotal ?? 0), 2, ',', '.') ?></td></tr>
<?php if (($desconto ?? 0) > 0): ?>
<tr><td style="font-size:14px;color:#059669;">Desconto</td><td style="font-size:14px;color:#059669;text-align:right;">-R$ <?= number_format((float)$desconto, 2, ',', '.') ?></td></tr>
<?php endif; ?>
<tr><td style="font-size:14px;color:#6b7280;">Frete</td><td style="font-size:14px;color:<?= ($frete ?? 0) == 0 ? '#059669' : '#111827' ?>;text-align:right;"><?= ($frete ?? 0) == 0 ? 'Gr&aacute;tis' : 'R$ ' . number_format((float)$frete, 2, ',', '.') ?></td></tr>
<tr><td style="font-size:16px;font-weight:bold;color:#111827;padding-top:8px;border-top:1px solid #e5e7eb;">Total</td><td style="font-size:16px;font-weight:bold;color:#2563eb;text-align:right;padding-top:8px;border-top:1px solid #e5e7eb;">R$ <?= number_format((float)($total ?? 0), 2, ',', '.') ?></td></tr>
</table>
</div>

<div style="background-color:#f9fafb;border-radius:12px;padding:20px;margin-top:24px;">
<p style="margin:0 0 8px;font-size:14px;color:#6b7280;"><strong>Endere&ccedil;o de Entrega:</strong></p>
<p style="margin:0;font-size:14px;color:#111827;"><?= htmlspecialchars($endereco ?? 'N/A') ?></p>
</div>

<p style="color:#6b7280;font-size:14px;line-height:1.6;margin:24px 0 0;">
Voc&ecirc; receber&aacute; um e-mail assim que o pagamento for confirmado.
</p>
</td></tr>
<tr><td style="background-color:#f9fafb;padding:24px 32px;text-align:center;">
<p style="color:#9ca3af;font-size:13px;margin:0;">&copy; <?= date('Y') ?> RATAPLAM - Roupas Infantis. Todos os direitos reservados.</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>
