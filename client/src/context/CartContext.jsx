import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const initialState = {
  items: [],
  tipoVenta: 'unitario', // 'unitario' | 'mayoreo'
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TIPO_VENTA':
      return { ...state, tipoVenta: action.payload };

    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id ? { ...i, cantidad: i.cantidad + (action.payload.cantidad || 1) } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, cantidad: action.payload.cantidad || 1 }],
      };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id
            ? { ...i, cantidad: Math.max(1, action.payload.cantidad) }
            : i
        ),
      };

    case 'CLEAR':
      return { ...state, items: [] };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const saved = JSON.parse(localStorage.getItem('holanda_cart') || 'null');
  const [state, dispatch] = useReducer(reducer, saved || initialState);

  useEffect(() => {
    localStorage.setItem('holanda_cart', JSON.stringify(state));
  }, [state]);

  function precioEfectivo(producto) {
    if (
      state.tipoVenta === 'mayoreo' &&
      producto.precio_mayoreo &&
      producto.cantidad >= producto.cantidad_minima_mayoreo
    ) {
      return parseFloat(producto.precio_mayoreo);
    }
    return parseFloat(producto.precio_unitario);
  }

  const subtotal = state.items.reduce((acc, item) => acc + precioEfectivo(item) * item.cantidad, 0);
  const totalItems = state.items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider value={{ ...state, subtotal, totalItems, dispatch, precioEfectivo }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
