<?php
declare(strict_types=1);

namespace Rataplam\Config;

class Config
{
    public static function get(string $chave, string $padrao = ''): string
    {
        $result = Database::fetch("SELECT valor FROM configuracoes WHERE chave = ?", [$chave]);
        return $result['valor'] ?? $padrao;
    }

    public static function set(string $chave, string $valor): bool
    {
        $exists = Database::count('configuracoes', 'chave = ?', [$chave]);
        if ($exists) {
            Database::update('configuracoes', ['valor' => $valor], 'chave = ?', [$chave]);
        } else {
            Database::insert('configuracoes', ['chave' => $chave, 'valor' => $valor]);
        }
        return true;
    }

    public static function getAll(string $grupo = ''): array
    {
        if ($grupo) {
            return Database::fetchAll("SELECT * FROM configuracoes WHERE grupo = ? ORDER BY chave", [$grupo]);
        }
        return Database::fetchAll("SELECT * FROM configuracoes ORDER BY grupo, chave");
    }
}
