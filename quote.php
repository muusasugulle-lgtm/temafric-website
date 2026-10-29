<?php
/**
 * Temafric — quotation request handler
 * Sends the contact-page form to the sales mailbox using GoDaddy's PHP mail().
 * Change $TO below if quote requests should go to another address.
 */
$TO   = 'sales@temafric.com';
$FROM = 'noreply@temafric.com';   // must be on the temafric.com domain for GoDaddy to relay it

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond($ok, $code = 200) {
    http_response_code($code);
    echo json_encode(['ok' => $ok]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(false, 405);

// Bot traps: hidden field must be empty; form must be open at least 3 seconds
if (!empty($_POST['website'])) respond(true);
$ts = isset($_POST['ts']) ? (int)$_POST['ts'] : 0;
if ($ts > 0 && (time() - $ts) < 3) respond(true);

function field($key, $max = 300, $multiline = false) {
    $v = isset($_POST[$key]) ? (string)$_POST[$key] : '';
    $v = trim(strip_tags($v));
    if (!$multiline) $v = preg_replace('/[\r\n\t]+/', ' ', $v);
    if (function_exists('mb_substr')) $v = mb_substr($v, 0, $max, 'UTF-8');
    else $v = substr($v, 0, $max);
    return $v;
}

$name     = field('name', 120);
$company  = field('company', 160);
$email    = field('email', 160);
$phone    = field('phone', 40);
$country  = field('country', 60);
$product  = field('product', 60);
$quantity = field('quantity', 80);
$location = field('location', 120);
$date     = field('date', 20);
$message  = field('message', 4000, true);
$lang     = field('lang', 2) === 'fr' ? 'FR' : 'EN';

if ($name === '' || $phone === '' || $message === '' || $product === '') respond(false, 422);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(false, 422);

$products = [
    'fuel' => 'Fuel', 'lubricants' => 'Lubricants', 'steel' => 'Steel', 'bitumen' => 'Bitumen',
    'chemicals' => 'Mining chemicals', 'spares' => 'Equipment & spares', 'logistics' => 'Logistics & transport',
    'site' => 'Site services', 'other' => 'Other',
];
$productLabel = isset($products[$product]) ? $products[$product] : $product;

$subject = 'Quotation request: ' . $productLabel . ' — ' . ($company !== '' ? $company : $name);

$lines = [
    'New quotation request from www.temafric.com',
    str_repeat('-', 44),
    'Name:              ' . $name,
    'Company:           ' . ($company !== '' ? $company : '-'),
    'Email:             ' . $email,
    'Phone / WhatsApp:  ' . $phone,
    'Country:           ' . ($country !== '' ? $country : '-'),
    'Product:           ' . $productLabel,
    'Quantity:          ' . ($quantity !== '' ? $quantity : '-'),
    'Delivery location: ' . ($location !== '' ? $location : '-'),
    'Required by:       ' . ($date !== '' ? $date : '-'),
    'Site language:     ' . $lang,
    str_repeat('-', 44),
    'Details:',
    $message,
    '',
    'Sent ' . gmdate('Y-m-d H:i') . ' UTC from IP ' . (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown'),
    'Reply to this email to answer the client directly.',
];
$body = implode("\r\n", $lines);

$headers  = 'From: Temafric Website <' . $FROM . ">\r\n";
$headers .= 'Reply-To: ' . $name . ' <' . $email . ">\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion();

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = @mail($TO, $encodedSubject, $body, $headers, '-f' . $FROM);

respond((bool)$sent, $sent ? 200 : 500);
