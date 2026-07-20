package models

type Inventario struct {
	IDInventario string `json:"id_inventario"`
	IDProducto   string `json:"id_producto"`
	Stock        int    `json:"stock"`
	StockMinimo  int    `json:"stock_minimo"`
}
