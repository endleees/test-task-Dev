<template>
  <div id="map" style="width: 100vw; height: 100vh"></div>
</template>
<div></div>
<script>
/* eslint-disable */


import {mkadCoords} from "@/data/mkadcoords";
import {findNearestCoordinate} from "@/utils/getNearestCoord/getNearestCoord";
import {styles} from "@/data/stylePolygons";
import '@/utils/paintOnMap/paintOnMap';


export default {
  name: 'MapComponent',
  data() {
    return {
      defaultAddress: [55.76, 37.64],
      distanceByAir: '',
      distanceByRoad: '',
        regions: '',
    }
  },
  mounted() {
    ymaps.ready(['ext.paintOnMap']).then(() => {
      const map = new ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 10,

      })
      let paintProcess
      const placemark = new ymaps.Placemark(this.defaultAddress, {}, {})
      const moscowPolygon = new ymaps.Polygon([mkadCoords]);
      // const control = myMap.controls.get('routePanelControl');
      // const polygon = new ymaps.Polygon()
      // Зададим состояние панели для построения машрутов.
      const button = new ymaps.control.Button({data: {content: 'Нарисовать свой регион'}, options: {maxWidth: 260}});
      let currentIndex =0
      const setClickEventMarker = map.events.add('click',(e)=>{
        const position = e.get('coords');
        placemark.geometry.setCoordinates(position);
        const markerCoords = map.geoObjects.get(0).geometry.getCoordinates();
        const NearestCoordinate = findNearestCoordinate(mkadCoords, markerCoords[0], markerCoords[1])

        const route = new ymaps.route([markerCoords, NearestCoordinate])
        route.then(routeRes => {
          map.geoObjects.add(routeRes);
          // Добавляем обработчик события routechange
          // routeRes.events.add('routechange', (el)=> {
          //   console.log(el)
          //   // Получаем геометрию маршрута
          //   const geometry = route.getPaths().get(0).getGeometry();
          //   // Получаем координаты точек маршрута
          //   const coords = geometry.getCoordinates();
          //   console.log(coords);
          // })
        }).catch(error => console.log('Ошибка: ', error));
        const lineOnAir = new ymaps.Polygon([[markerCoords, NearestCoordinate]])
        map.geoObjects.add(lineOnAir)
        map.panTo(position, {
          duration: 500,
          zoom: 10,
        });

      })
      map.controls.add(button);
      button.events.add('click',()=>{
        if(button.isSelected()){
          map.events.cleanup('mousedown')
          map.events.cleanup('mouseup')

          setClickEventMarker
        }
        else {
          map.events.cleanup('click')
          map.events.add('mousedown', function (e) {
            // Если кнопка мыши была нажата с зажатой клавишей "alt", то начинаем рисование контура.
            if (e.get('altKey')) {
              currentIndex === styles.length - 1 ? currentIndex = 0 : currentIndex += 1

              paintProcess = ymaps.ext.paintOnMap(map, e, {style: styles[currentIndex]});
            }
          });
          map.events.add('mouseup', function (e) {
            if (paintProcess) {

              // Получаем координаты отрисованного контура.
              const coordinates = paintProcess.finishPaintingAt(e);
              paintProcess = null;
              // В зависимости от состояния кнопки добавляем на карту многоугольник или линию с полученными координатами.

              const geoObject = new ymaps.Polygon([coordinates], {}, styles[currentIndex]);

              map.geoObjects.add(geoObject);
            }
          });
        }
      })




      map.geoObjects.add(placemark)
      map.geoObjects.add(moscowPolygon)
    })


  },

  methods: {

  }
}
</script>