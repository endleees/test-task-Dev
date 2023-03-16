<template>
  <div
    id="map"
    style="width: 100vw; height: 100vh"
  />
</template>
<script>

import coords from '../data/coords';
import findNearestCoordinate from '../utils/getNearestCoord/getNearestCoord';
import store from '../state/store';

export default {
  name: 'MapComponent',
  data() {
    return {
      coords: {
        lan: '',
        lng: '',
      },
    };
  },
  mounted() {
    window.ymaps.ready().then(() => {
      const map = new window.ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 10,

      });
      let mainPlacemark;
      const setNewPlacemark = (eventCoords) => {
        // Удаляем все объекты на карте
        map.geoObjects.removeAll();
        // Создаем новый маркер
        mainPlacemark = new window.ymaps.Placemark(eventCoords);
        // Добавляем новый маркер на карту
        map.geoObjects.add(mainPlacemark);
      };
      // Новая область на карте
      const createNewPolygon = (ArrayCoords) => new window.ymaps.Polygon([ArrayCoords]);

      // Новая линия на карте
      const lineOnAir = (propMarkerCoords, propNearestCoordinate) => (
        new window.ymaps.Polygon([[propMarkerCoords, propNearestCoordinate]])
      );

      // Новый маршрут на карте
      const route = (propMarkerCoords, nearestCoordinate) => (
        // eslint-disable-next-line new-cap
        new window.ymaps.route([propMarkerCoords, nearestCoordinate])
      );
      // Создание нового объекта на карте
      const addObjectOnMap = (object) => map.geoObjects.add(object);
      map.events.add('click', (e) => {
        // Узнать координаты клика
        const position = e.get('coords');
        setNewPlacemark(position, mainPlacemark, map);
        // Задать новую координату для нового маркера
        mainPlacemark.geometry.setCoordinates(position);
        const markerCoords = map.geoObjects.get(0).geometry.getCoordinates();
        // Добавление состояния в localstorage
        store.dispatch('addCoordinate', markerCoords);
        // Перебор всех регионов
        coords.forEach((city) => {
          // Вычисление ближайшей координаты к новому маркеру
          const nearestCoordinate = findNearestCoordinate(city, markerCoords[0], markerCoords[1]);

          route(markerCoords, nearestCoordinate)
            .then((routeRes) => {
              addObjectOnMap(routeRes);
            })
            .catch((error) => {
              throw new Error(error);
            });

          // Добавление регионов на карту
          addObjectOnMap(createNewPolygon(city));
          addObjectOnMap(lineOnAir(markerCoords, nearestCoordinate));
        });
        // Плавный переход к метке
        map.panTo(position, {
          duration: 500,
          zoom: 10,
        });
      });

      // Добавление полигонов
      coords.forEach((city) => addObjectOnMap(createNewPolygon(city)));
    });
  },

  methods: {
  },
};
</script>
