<?php

namespace app\components;

use ReflectionMethod;
use yii\base\ActionEvent;
use yii\filters\auth\HttpBearerAuth;
use yii\helpers\Inflector;
use yii\helpers\StringHelper;
use yii\rest\Controller;
use yii\rest\UrlRule;
use yii\base\InlineAction;
use Yii;

class RestSetup extends \yii\base\Behavior
{
    public $cors;

    public function events()
    {
        return [
            'beforeRequest' => function () {
                $this->handleCors();
                $this->setupRest();
                $this->registerUrlRule();
            },
            'beforeAction' => function (ActionEvent $event) {
                $this->userHasAccess($event);
                $this->setPaginationClass($event->action);
            },
        ];
    }

    protected function handleCors()
    {
        $req = Yii::$app->request;
        if (!$req->origin or $req->origin === $req->hostInfo) {
            return;
        }

        $filter = new \yii\filters\Cors();

        foreach ((array) $this->cors as $key => $value) {
            $filter->cors[$key] = $value;
        }

        $filter->cors['Access-Control-Expose-Headers'][] = 'X-Pagination-Per-Page';
        $filter->cors['Access-Control-Expose-Headers'][] = 'X-Pagination-Total-Count';

        $dummyAction = (object)['id' => 0];
        if (!$filter->beforeAction($dummyAction)) {
            Yii::$app->end();
        }
    }

    protected function setupRest()
    {
        Yii::$app->request->parsers['application/json'] = 'yii\web\JsonParser';
        Yii::$app->request->parsers['multipart/form-data'] = 'yii\web\MultipartFormDataParser';
        Yii::$app->request->enableCsrfValidation = false;
        Yii::$app->response->format = 'json';
        Yii::$app->response->on('beforeSend', [$this, 'formatResponse']);
        Yii::$app->user->loginUrl = null;
        Yii::$app->user->enableSession = false;
        Yii::$app->urlManager->enablePrettyUrl = true;
    }

    protected function registerUrlRule()
    {
        @list($module, $controller) = explode('/', Yii::$app->request->pathInfo);
        $api = StringHelper::dirname(__NAMESPACE__) . '\\';

        if (empty($module)) {
            $route = Yii::$app->defaultRoute;
            $prefix = $api . $route;
        } else {
            if (empty($controller)) {
                $controller = 'default';
            }
            $route = "$module/$controller";
            $prefix = $api . 'modules\\' . $module;
        }

        $controllerClass = $prefix . '\\controllers\\' . Inflector::camelize($controller) . 'Controller';

        $restRule = [
            'class' => UrlRule::class,
            'pluralize' => false,
            'controller' => $route,
        ];

        if ($this->addUrlRule($restRule, $controllerClass)) {
            return;
        }

        $route = rtrim(Yii::$app->request->pathInfo, '/');
        Yii::$app->request->pathInfo = $route;
        $prefix = $api . 'controllers\\';

        do {
            $restRule['controller'] = $route;
            $namespace = $prefix;

            if ($ns = trim(dirname($route), '.')) {
                $namespace .= str_replace('/', '\\', $ns) . '\\';
            }

            $controllerClass = $namespace . Inflector::camelize(basename($route)) . 'Controller';
            if ($this->addUrlRule($restRule, $controllerClass)) {
                return;
            }
        } while ($route = trim(dirname($route), '.'));
    }

    protected function addUrlRule($rule, $controller)
    {
        if (!class_exists($controller)) {
            return;
        }

        if (is_callable([$controller, 'extraUrlRules'])) {
            $rule['extraPatterns'] = $controller::extraUrlRules();
        }

        Yii::$app->urlManager->addRules([$rule]);

        return true;
    }

    protected function userHasAccess($event)
    {
        if (!$event->isValid OR !Yii::$app->controller instanceof Controller) {
            return;
        }

        $action = $event->action;
        if ($actions = Yii::$app->controller->skipAuth ?? null) {
            if ($actions === true OR $actions === '*') {
                return true;
            }

            if (is_string($actions)) {
                $actions = preg_split('/\s*(,|\|)\s*/', $actions);
            }

            if (in_array($action->id, $actions)) {
                return true;
            }
        }

        if ($action instanceof InlineAction) {
            $method = new ReflectionMethod(Yii::$app->controller, 'action' . Inflector::classify($action->id));
            if (preg_match('/\s@skip-auth\s/', $method->getDocComment())) {
                return;
            }
        }

        return (new HttpBearerAuth)->beforeAction($action);
    }

    protected function setPaginationClass($action)
    {
        if ($action->id === 'index') {
            Yii::$container->set('yii\data\Pagination', Pagination::class);
        }
    }

    public function formatResponse(yii\base\Event $e)
    {
        $data = Yii::$app->response->data;

        if ($ex = Yii::$app->errorHandler->exception) {
        } else {
            if (is_array($data) && isset($data[0]['message'])) {
                $respon = [];
                foreach ($data as $i => $error) {
                    $respon[$error['field']] = $error['message'];
                }
                Yii::$app->response->data = $respon;
            }
        }
    }

}
