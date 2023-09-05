<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace app\cli;

use yii\console\Controller;
use yii\helpers\Console;
use yii\helpers\FileHelper;
use Yii;


class InstallController extends Controller
{
    public function actionIndex()
    {
        $dir = __DIR__.'/../config';
        if (is_file("$dir/env/web.php")) {
            Console::output(" Previous installation was done successfully.\n");
            if (!Console::confirm(" Do you want to reinstall?")) {
                return;
            }
        }

        Console::output("== Starting Installation Wizard ==\n");

        Console::output(" > Select environment\n 1 - Development\n 2 - Production");
        $env = Console::prompt(' Your answer:', ['required' => 1, 'validator' => fn ($i) => in_array($i, [1,2])]);

        $common = file_get_contents("$dir/env-sample/common.php");
        $web = file_get_contents("$dir/env-sample/web.php");

        if ($env == '2') {
            $common = preg_replace("/defined\(/", "// defined(", $common);
        }

        $this->setDbCredentials($common);
        $this->setRandomKey($common, 'jwtKey');
        $this->setRandomKey($web, 'cookieValidationKey');

        FileHelper::createDirectory("$dir/env");
        Console::output(" Saving configs...");
        file_put_contents("$dir/env/common.php", $common);
        file_put_contents("$dir/env/web.php", $web);

        Console::output(" Installation done.\n");
    }

    protected function setDbCredentials(&$config)
    {
        $defaultDatabase = 'blangko';


        Console::output("\n Set database credentials");
        Console::output(" > Select driver:\n 1 - mysql\n 2 - pgsql");

        $driver = Console::prompt(" Your answer:", ['required' => 1, 'validator' => fn($i) => in_array($i,[1,2])]);
        $host = Console::prompt(" > host:", ['default' => 'localhost']);
        $port = Console::prompt(" > port:", ['default' => [1=>'3306', 2=>'5432'][$driver]]);
        $port = $port ? $port : [1=>'3306', 2=>'5432'][$driver];

        $dbname = Console::prompt(" > database:", ['default' => $defaultDatabase]);
        $dbuser = Console::prompt(" > username:", ['required' => 1]);
        $dbpass = Console::prompt(" > password:", ['required' => 1]);

        $driver = $driver == 1 ? 'mysql' : 'pgsql';
        $dsn = sprintf("%s:host=%s;port=%s;dbname=%s", $driver, $host, $port, $dbname);

        $config = preg_replace("/'dsn'.*',\n/", "'dsn' => '$dsn',\n", $config);
        $config = preg_replace("/'username' => ''/", "'username' => '$dbuser'", $config);
        $config = preg_replace("/'password' => ''/", "'password' => '$dbpass'", $config);
        Console::output(" Done.\n");
    }

    protected function setRandomKey(&$config, $key)
    {
        Console::output(" Generating random key for '$key'...");
        $string = strtoupper(substr(base64_encode(Yii::$app->security->generateRandomKey()), 0, 32));
        $config = str_replace("'$key' => ''", "'$key' => '$string'", $config);
        Console::output(" Done.\n");
    }
}
