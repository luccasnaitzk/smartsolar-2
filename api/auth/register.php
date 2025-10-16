<?php
require_once __DIR__.'/../config.php';
$body = read_json();
require_fields($body, ['name','email','password']);
$name = trim($body['name']);
$email = trim($body['email']);
$pass = $body['password'];
try {
  $pdo = db();
  $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
  $stmt->execute([$email]);
  if ($stmt->fetch()) send_json(['error'=>'E-mail já cadastrado'], 409);
  $hash = password_hash($pass, PASSWORD_BCRYPT);
  $pdo->prepare('INSERT INTO users(name,email,password_hash) VALUES (?,?,?)')->execute([$name,$email,$hash]);
  $id = $pdo->lastInsertId();
  send_json(['user' => ['id'=>$id,'name'=>$name,'email'=>$email] ]);
} catch (Exception $e) {
  send_json(['error'=>$e->getMessage()], 500);
}
