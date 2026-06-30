<?php
declare(strict_types=1);

namespace Rataplam\Config;

use PDO;
use PDOException;

date_default_timezone_set('America/Sao_Paulo');

class Database
{
    private static ?PDO $instance = null;
    private static ?string $driver = null;

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $driver = getenv('DB_DRIVER') ?: 'sqlite';
            self::$driver = $driver;

            if ($driver === 'sqlite') {
                $path = getenv('DB_PATH') ?: (dirname(__DIR__, 2) . '/database/rataplam.db');
                $dir = dirname($path);
                if (!is_dir($dir)) {
                    mkdir($dir, 0755, true);
                }
                $dsn = "sqlite:{$path}";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];
            } else {
                $host = getenv('DB_HOST') ?: 'localhost';
                $port = getenv('DB_PORT') ?: '3306';
                $name = getenv('DB_NAME') ?: 'rataplam';
                $user = getenv('DB_USER') ?: 'root';
                $pass = getenv('DB_PASS') ?: '';
                $charset = 'utf8mb4';

                $dsn = "mysql:host={$host};port={$port};dbname={$name};charset={$charset}";
                $initAttr = defined('Pdo\Mysql::ATTR_INIT_COMMAND') ? \Pdo\Mysql::ATTR_INIT_COMMAND : PDO::MYSQL_ATTR_INIT_COMMAND;
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    $initAttr => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
                ];
            }

            try {
                self::$instance = new PDO($dsn, $driver === 'sqlite' ? null : $user, $driver === 'sqlite' ? null : $pass, $options);
                if ($driver === 'sqlite') {
                    self::$instance->exec('PRAGMA journal_mode=WAL');
                    self::$instance->exec('PRAGMA foreign_keys=ON');
                    self::$instance->exec('PRAGMA busy_timeout=5000');
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['erro' => 'Erro de conexão com o banco de dados', 'mensagem' => $e->getMessage()]);
                exit;
            }
        }

        return self::$instance;
    }

    public static function getDriver(): string
    {
        if (self::$driver === null) {
            self::getInstance();
        }
        return self::$driver ?? 'sqlite';
    }

    public static function isSQLite(): bool
    {
        return self::getDriver() === 'sqlite';
    }

    public static function query(string $sql, array $params = []): \PDOStatement
    {
        $stmt = self::getInstance()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public static function fetch(string $sql, array $params = []): ?array
    {
        return self::query($sql, $params)->fetch() ?: null;
    }

    public static function fetchAll(string $sql, array $params = []): array
    {
        return self::query($sql, $params)->fetchAll();
    }

    public static function insert(string $table, array $data): int
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        self::query($sql, array_values($data));
        return (int) self::getInstance()->lastInsertId();
    }

    public static function update(string $table, array $data, string $where, array $whereParams = []): int
    {
        $set = implode(', ', array_map(fn($col) => "{$col} = ?", array_keys($data)));
        $sql = "UPDATE {$table} SET {$set} WHERE {$where}";
        $stmt = self::query($sql, array_merge(array_values($data), $whereParams));
        return $stmt->rowCount();
    }

    public static function delete(string $table, string $where, array $params = []): int
    {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        $stmt = self::query($sql, $params);
        return $stmt->rowCount();
    }

    public static function count(string $table, string $where = '1=1', array $params = []): int
    {
        $sql = "SELECT COUNT(*) as total FROM {$table} WHERE {$where}";
        $result = self::fetch($sql, $params);
        return (int) ($result['total'] ?? 0);
    }

    // ── SQLite-compatible date helpers ──────────────

    public static function now(): string
    {
        return self::isSQLite() ? "datetime('now', 'localtime')" : 'NOW()';
    }

    public static function curdate(): string
    {
        return self::isSQLite() ? "date('now', 'localtime')" : 'CURDATE()';
    }

    public static function dateSub(string $interval): string
    {
        if (!self::isSQLite()) {
            return "DATE_SUB(NOW(), INTERVAL {$interval})";
        }

        $parts = explode(' ', trim($interval));
        $amount = (int)($parts[0] ?? 0);
        $unit = strtolower($parts[1] ?? 'day');

        $map = [
            'minute' => 'minutes',
            'hour' => 'hours',
            'day' => 'days',
            'week' => 'days',
            'month' => 'months',
            'year' => 'years',
        ];

        $sqliteUnit = $map[$unit] ?? 'days';
        if ($unit === 'week') {
            $amount *= 7;
        }

        return "datetime('now', '-{$amount} {$sqliteUnit}', 'localtime')";
    }

    public static function dateFormat(string $col, string $format): string
    {
        if (!self::isSQLite()) {
            return "DATE_FORMAT({$col}, '{$format}')";
        }

        $map = [
            '%Y' => '%Y',
            '%m' => '%m',
            '%d' => '%d',
            '%H' => '%H',
            '%i' => '%M',
            '%s' => '%S',
            '%Y-%m' => '%Y-%m',
            '%Y-%m-%d' => '%Y-%m-%d',
        ];

        $sqliteFmt = strtr($format, $map);
        return "strftime('{$sqliteFmt}', {$col})";
    }

    public static function year(string $col): string
    {
        return self::isSQLite() ? "strftime('%Y', {$col})" : "YEAR({$col})";
    }

    public static function yearWeek(string $col): string
    {
        if (!self::isSQLite()) {
            return "YEARWEEK({$col}, 1)";
        }
        return "strftime('%Y%W', {$col})";
    }

    public static function hour(string $col): string
    {
        return self::isSQLite() ? "CAST(strftime('%H', {$col}) AS INTEGER)" : "HOUR({$col})";
    }

    public static function dateFunc(string $col): string
    {
        return self::isSQLite() ? "date({$col})" : "DATE({$col})";
    }

    public static function jsonGroupArray(string $expr): string
    {
        return self::isSQLite() ? "json_group_array({$expr})" : "JSON_ARRAYAGG({$expr})";
    }

    public static function jsonObject(array $keyValuePairs): string
    {
        $parts = [];
        foreach ($keyValuePairs as $key => $val) {
            $parts[] = "'{$key}', {$val}";
        }
        $args = implode(', ', $parts);
        return self::isSQLite() ? "json_object({$args})" : "JSON_OBJECT({$args})";
    }
}
