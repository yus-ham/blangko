<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace app\cli;

use yii\console\Controller;
use yii\console\ExitCode;
use Yii;
use yii\db\Connection;

class MigrasiDbController extends Controller
{
    /**
     * This command echoes what you have entered as the message.
     * @param string $message the message to be echoed.
     */
    public function actionIndex($message = 'hello world')
    {
        /** @var Connection $dbOld */
        $dbOld = Yii::$app->db_sqlsrv;
        $dbNew = Yii::$app->db;

        foreach ($dbOld->schema->getTableSchemas() as $i => $schema) {
            echo $i .' ' .$schema->name."\n";
        }
    }
}
