<?php
declare(strict_types=1);

namespace Rataplam\Services;

use Rataplam\Config\Config;
use Rataplam\Config\Database;

class EmailService
{
    private string $host;
    private int $porta;
    private string $criptografia;
    private string $usuario;
    private string $senha;
    private string $deNome;
    private string $deEmail;
    private string $replyTo;

    public function __construct()
    {
        $this->host = Config::get('smtp_host', 'smtp.gmail.com');
        $this->porta = (int) Config::get('smtp_porta', '587');
        $this->criptografia = Config::get('smtp_criptografia', 'tls');
        $this->usuario = Config::get('smtp_usuario', '');
        $this->senha = Config::get('smtp_senha', '');
        $this->deNome = Config::get('smtp_de_nome', 'RATAPLAM');
        $this->deEmail = Config::get('smtp_de_email', 'contato@rataplam.com.br');
        $this->replyTo = Config::get('smtp_reply_to', $this->deEmail);
    }

    public function enviar(string $destinatario, string $assunto, string $html, string $template = '', array $dados = []): bool
    {
        try {
            $boundary = md5(uniqid(time()));

            $headers = "From: =?UTF-8?B?" . base64_encode($this->deNome) . "?= <{$this->deEmail}>\r\n";
            $headers .= "Reply-To: {$this->replyTo}\r\n";
            $headers .= "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
            $headers .= "X-Mailer: RATAPLAM-Mailer/1.0\r\n";
            $headers .= "Date: " . date('r') . "\r\n";

            $body = "--{$boundary}\r\n";
            $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
            $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
            $body .= base64_encode($this->htmlParaTexto($html)) . "\r\n\r\n";
            $body .= "--{$boundary}\r\n";
            $body .= "Content-Type: text/html; charset=UTF-8\r\n";
            $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
            $body .= base64_encode($html) . "\r\n\r\n";
            $body .= "--{$boundary}--";

            $resultado = mail($destinatario, $assunto, $body, $headers);

            Database::insert('email_logs', [
                'destinatario' => $destinatario,
                'assunto' => $assunto,
                'template' => $template,
                'dados' => json_encode($dados),
                'status' => $resultado ? 'enviado' : 'erro',
                'erro' => $resultado ? null : 'Falha no envio via mail()',
            ]);

            return $resultado;
        } catch (\Exception $e) {
            Database::insert('email_logs', [
                'destinatario' => $destinatario,
                'assunto' => $assunto,
                'template' => $template,
                'dados' => json_encode($dados),
                'status' => 'erro',
                'erro' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function enviarTemplate(string $destinatario, string $template, array $dados): bool
    {
        $assunto = $dados['assunto'] ?? 'RATAPLAM';
        $html = $this->carregarTemplate($template, $dados);

        return $this->enviar($destinatario, $assunto, $html, $template, $dados);
    }

    private function carregarTemplate(string $template, array $dados): string
    {
        $caminho = __DIR__ . '/../templates/email/' . $template . '.php';

        if (!file_exists($caminho)) {
            $caminho = __DIR__ . '/../templates/email/base.php';
        }

        ob_start();
        extract($dados);
        include $caminho;
        return ob_get_clean();
    }

    private function htmlParaTexto(string $html): string
    {
        $texto = strip_tags($html);
        $texto = preg_replace('/\s+/', ' ', $texto);
        return trim($texto);
    }
}
