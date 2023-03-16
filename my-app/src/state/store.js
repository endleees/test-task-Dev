import Vuex from 'vuex';

const DEFAULT_COUNT_STORAGE = 10;
const store = new Vuex.Store({
  state: {
    coordinates: JSON.parse(localStorage.getItem('coordinates')) || [],
  },
  mutations: {
    addCoordinate(state, coordinate) {
      if (state.coordinates.length >= DEFAULT_COUNT_STORAGE) {
        state.coordinates.pop(); // удалить последний элемент
      }
      state.coordinates.unshift(coordinate); // добавить новый элемент в начало массива
      localStorage.setItem('coordinates', JSON.stringify(state.coordinates));
    },
  },
  actions: {
    addCoordinate({ commit }, coordinate) {
      commit('addCoordinate', coordinate);
    },
  },
});

export default store;
