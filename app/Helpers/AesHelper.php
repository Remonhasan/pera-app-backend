<?php

namespace App\Helpers {

  class AesHelper
  {
    private static ?string $resolvedKey = null;
    private static ?string $resolvedIv = null;               // 16 chars

    // Encrypt plaintext using AES-256-CBC
    public static function encrypt(string $plaintext, ?string $key = null, ?string $iv = null): string
    {
      // Key: 32 chars, IV: 16 chars
      $encryptionKey = $key ?? self::resolveKey();
      $encryptionIv = $iv ?? self::resolveIv();

      $ciphertext = openssl_encrypt(
        $plaintext,
        'AES-256-CBC',
        $encryptionKey,
        OPENSSL_RAW_DATA,  // important to get raw bytes
        $encryptionIv
      );

      return base64_encode($ciphertext); // send as base64 to frontend
    }

    // Decrypt base64 ciphertext
    public static function decrypt(string $cipherBase64, ?string $key = null, ?string $iv = null): string
    {
      $cipherBytes = base64_decode($cipherBase64);

      $decryptionKey = $key ?? self::resolveKey();
      $decryptionIv = $iv ?? self::resolveIv();

      $plaintext = openssl_decrypt(
        $cipherBytes,
        'AES-256-CBC',
        $decryptionKey,
        OPENSSL_RAW_DATA,
        $decryptionIv
      );

      return $plaintext;
    }

    private static function resolveKey(): string
    {
      if (self::$resolvedKey !== null) {
        return self::$resolvedKey;
      }

      $secret = config('app.encrypt_secret_key');

      if (empty($secret)) {
        $secret = env('ENCRYPT_SECRET_KEY');
      }

      if (empty($secret)) {
        throw new \RuntimeException('Encryption secret key is not configured.');
      }

      return self::$resolvedKey = $secret;
    }

    private static function resolveIv(): string
    {
      if (self::$resolvedIv !== null) {
        return self::$resolvedIv;
      }

      $secretIv = config('app.encrypt_secret_iv');

      if (empty($secretIv)) {
        $secretIv = env('ENCRYPT_SECRET_IV');
      }

      if (empty($secretIv)) {
        throw new \RuntimeException('Encryption IV is not configured.');
      }
      return self::$resolvedIv = $secretIv;
    }
  }
}

namespace {

  use App\Helpers\AesHelper;

  if (!function_exists('encryptData')) {
    function encryptData($data)
    {
      // Convert arrays/objects to JSON string before encrypting
      if (!is_string($data)) {
        $data = json_encode($data);
      }
      return AesHelper::encrypt($data);
    }
  }

  if (!function_exists('decryptData')) {
    function decryptData($data)
    {
      return AesHelper::decrypt($data);
    }
  }
}
