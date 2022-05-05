<?php
namespace app\components;

use Yii;
use yii\web\UnprocessableEntityHttpException as _422Response;

class Pagination extends \yii\data\Pagination {

  // min, max
  public $pageSizeLimit = [-1, 200];

  public function setPage($value, $validatePage = false) {
    parent::setPage($value, $validatePage);

    if ($value === null OR ! ($validatePage && $this->validatePage)) {
      return;
    }
    $value = (int)$value;
    $pageCount = $this->getPageCount();

    if ($this->totalCount === 0) {
      return;
    }
    if ($value < 0 OR $value >= $pageCount) {
      throw new _422Response('Invalid page');
    }
  }

  // public function getOffset() {
  //   return Yii::$app->request->get('offset');
  // }
}
