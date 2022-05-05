<?php
namespace app\components;

use Yii;

class ModuleLoader extends \yii\base\Behavior {

  public function events() {
    return [
      'beforeRequest' => function() { $this->beforeRequest(); },
    ];
  }

  protected function beforeRequest() {
    if (Yii::$app->request->isConsoleRequest) {
      return;
    }
    @list($moduleId) = explode('/', Yii::$app->request->pathInfo);

    try {
      $moduleNs = 'app\modules\\'. $moduleId .'\\';
      $module = Yii::createObject([
        '__class' => $moduleNs .'Module',
        'controllerNamespace' => $moduleNs .'controllers',
      ], [$moduleId]);

      Yii::$app->setModule($moduleId, $module);
    } catch (\Exception $ex) {
      //Yii::error($ex, __METHOD__);
    }
  }

}
