/* eslint-disable */
ymaps.modules.define('ext.paintOnMap', ['meta', 'util.extend', 'pane.EventsPane', 'Event'], function (provide, meta, extend, EventsPane, Event) {
    'use strict';

    // zIndex пейна событий карты по умолчанию равен 500.
    // Подробней в документации: https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/map.pane.Manager-docpage/
    const EVENTS_PANE_ZINDEX = 500;

    const DEFAULT_UNWANTED_BEHAVIORS = ['drag', 'scrollZoom'];
    const DEFAULT_STYLE = {strokeColor: '#0000ff', strokeWidth: 1, strokeOpacity: 1};
    const DEFAULT_TOLERANCE = 16;

    const badFinishPaintingCall = function () {
        throw new Error('(ymaps.ext.paintOnMap) некорректный вызов PaintingProcess#finishPaintingAt. Рисование уже завершено.');
    };

    /**
     * @interface ymaps.ext.paintOnMap.PaintingProcess
     */

    /**
     * Отключает режим рисования.
     * @function
     * @name ymaps.ext.paintOnMap.PaintingProcess#finishPaintingAt
     * @param {Number[]|ymaps.Event} [positionOrEvent] Координаты точки, в которой рисование должно закончиться.
     * Координаты задаются в пикселях относительно верхнего левого угла карты.
     * @return {Number[]} Координаты.
     */

    /**
     * Включает режим рисования.
     * @name ymaps.ext.paintOnMap
     * @param {ymaps.Map} map
     * @param {Number[]|ymaps.Event} [positionOrEvent] Координаты точки, в которой рисование должно закончиться.
     * Координаты задаются в пикселях относительно верхнего левого угла карты.
     * @param {Object} [config]
     * @param {String[]|null} [config.unwantedBehaviors] Список поведений карты, которые должны быть выключены во время
     * рисования. Перетаскивание карты и её масштабирование колесом мыши выключены по умолчанию.
     * @param {Object} [config.style] Стили такие же, как в ymaps.Polygon или ymaps.Polyline.
     * @param {String} [config.style.strokeColor='#0000ff'] Цвет линии или обводки.
     * @param {Number} [config.style.strokeWidth=1] Толщина линии или обводки.
     * @param {Number} [config.style.strokeOpacity=1] Прозрачность линии или обводки.
     * @param {Number} [config.tolerance=16] Уровень упрощения координат в пикселях.
     * @returns {ymaps.ext.paintOnMap.PaintingProcess} Процесс рисования.
     */
    function paintOnMap(map, positionOrEvent, config) {
        config = config || {};
        const style = extend(DEFAULT_STYLE, config.style || {});

        const unwantedBehaviors = config.unwantedBehaviors === undefined ?
            DEFAULT_UNWANTED_BEHAVIORS : config.unwantedBehaviors;

        const pane = new EventsPane(map, {
            css: {position: 'absolute', width: '100%', height: '100%'},
            zIndex: EVENTS_PANE_ZINDEX + 50,
            transparent: true
        });

        map.panes.append('ext-paint-on-map', pane);

        if (unwantedBehaviors) {
            map.behaviors.disable(unwantedBehaviors);
        }

        // Создаём canvas-элемент.
        let canvas = document.createElement('canvas');
        let ctx2d = canvas.getContext('2d');
        let rect = map.container.getParentElement().getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        ctx2d.globalAlpha = style.strokeOpacity;
        ctx2d.strokeStyle = style.strokeColor;
        ctx2d.lineWidth = style.strokeWidth;

        canvas.style.width = '100%';
        canvas.style.height = '100%';

        pane.getElement().appendChild(canvas);

        let firstPosition = positionOrEvent ? toPosition(positionOrEvent) : null;
        let coordinates = firstPosition ? [firstPosition] : [];

        let bounds = map.getBounds();
        const latDiff = bounds[1][0] - bounds[0][0];
        const lonDiff = bounds[1][1] - bounds[0][1];

        canvas.onmousemove = function (e) {
            coordinates.push([e.offsetX, e.offsetY]);

            ctx2d.clearRect(0, 0, canvas.width, canvas.height);
            ctx2d.beginPath();

            ctx2d.moveTo(coordinates[0][0], coordinates[0][1]);
            for (let i = 1; i < coordinates.length; i++) {
                ctx2d.lineTo(coordinates[i][0], coordinates[i][1]);
            }

            ctx2d.stroke();
        }.bind(this);

        // Создаём косвенное обращение, чтобы не сдерживать сборщик мусора.
        let paintingProcess = {
            finishPaintingAt: function (positionOrEvent) {
                paintingProcess.finishPaintingAt = badFinishPaintingCall;

                // Получаем координаты, прежде чем удалить пейн.
                if (positionOrEvent) {
                    coordinates.push(toPosition(positionOrEvent));
                }

                map.panes.remove(pane);
                if (unwantedBehaviors) {
                    map.behaviors.enable(unwantedBehaviors);
                }

                const tolerance = config.tolerance === undefined ? DEFAULT_TOLERANCE : Number(config.tolerance);
                if (tolerance) {
                    coordinates = simplify(coordinates, tolerance);
                }
                // Преобразовываем координаты canvas-элемента в геодезические координаты.
                return coordinates.map(function (x) {
                    const lon = bounds[0][1] + (x[0] / canvas.width) * lonDiff;
                    const lat = bounds[0][0] + (1 - x[1] / canvas.height) * latDiff;

                    return  [lon, lat];
                });
            }
        };

        return paintingProcess;
    }

    function toPosition(positionOrEvent) {
        return positionOrEvent instanceof Event ?
            [positionOrEvent.get('offsetX'), positionOrEvent.get('offsetY')] :
            positionOrEvent;
    }

    function simplify(coordinates, tolerance) {
        const toleranceSquared = tolerance * tolerance;
        const simplified = [coordinates[0]];

        let prev = coordinates[0];
        for (let i = 1; i < coordinates.length; i++) {
            let curr = coordinates[i];
            if (Math.pow(prev[0] - curr[0], 2) + Math.pow(prev[1] - curr[1], 2) > toleranceSquared) {
                simplified.push(curr);
                prev = curr;
            }
        }

        return simplified;
    }

    provide(paintOnMap);
});
