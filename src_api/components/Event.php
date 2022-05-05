<?php

namespace app\components;

class Event extends \yii\base\Event
{
    public $detail;

    public function __construct($detail = null, $config = [])
    {
        $this->detail = $detail === null ? null : (object)$detail;
        parent::__construct($config);
    }

    public static function trigger($class, $name, $event = null)
    {
        if (!$event) {
            $event = new Event($event);
        }
        parent::trigger($class, $name, $event);
    }

    public function dispatch(\yii\base\Component $component, $name, $event)
    {
        if (!$event) {
            $event = new Event($event);
        }

        $component->trigger($name, $event);
    }
}
