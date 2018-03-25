const Report = require('../report').Report;

class DevolutionsReport extends Report {

    constructor(connectionPool){
    	super(connectionPool);
    }

    _tableDefinition(){
        return `(
            Transaction_Code varchar(256),
            Product_Code VARCHAR(12),
            RC VARCHAR(20),
            Cuenta_41500 VARCHAR(40),
            Descuentos VARCHAR(40)
        )`;
    }

    _reportQuery(tmpTable){
        return `
        select
			t.Transaction_Code,
			t.Product_Code,
			t.RC,
			t.Cuenta_41500,
			t.Descuentos,
			coalesce(v.TRANSACTION_CODE_PRODUCTO,w1.transaction_code_producto,w2.transaction_code_producto,w3.transaction_code_producto) as Sub_Transaction,
			coalesce(v.ProductoOriginal,w1.ProductoOriginal,w2.ProductoOriginal,w3.ProductoOriginal) as ProductoOriginal,
			coalesce(v.Sub_Producto,w1.Producto,w2.Producto,w3.Producto) as Producto,
			coalesce(v.Fecha_Emision,w1.Fecha_Reserva,w2.Fecha_Reserva,w3.Fecha_Reserva) as Emision
		from
			${tmpTable} t
			left join venta v on (t.Transaction_Code = v.TRANSACTION_CODE and t.Product_Code = v.Product_Code)
			left join wiki_resumida w1 on (t.Transaction_Code = w1.TRANSACTION_CODE and t.Product_Code = w1.Product_Code)
			left join wiki_resumida w2 on (t.Transaction_Code = w2.transaction_code_producto)
			left join wiki_resumida w3 on (t.Transaction_Code = w3.transaction_code_padre and t.Product_Code = w3.Product_Code)
		where
			not exists (select 1 from venta v2 where v2.id>v.id and
				t.Transaction_Code = v2.TRANSACTION_CODE and t.Product_Code = v2.Product_Code)
			and
			not exists (select 1 from wiki_resumida w12 where w12.id>w1.id and
				t.Transaction_Code = w12.TRANSACTION_CODE and t.Product_Code = w12.Product_Code)
			and
			not exists (select 1 from wiki_resumida w22 where w22.id>w2.id and
				t.Transaction_Code = w22.transaction_code_producto)
			and
			not exists (select 1 from wiki_resumida w32 where w32.id>w3.id and
				t.Transaction_Code = w32.transaction_code_padre and t.Product_Code = w32.Product_Code)
		;
        `;
    }

    _reportHeader(){
        return [
            `Transaction_Code`,
            `Sub_Transaction`,
            `Product_Code`,
            `Responsable de Cargo`,
            `ProductoOriginal`,
            `Producto`,
            `Cuenta_41500`,
			`Descuentos`,
            `Emision`
        ].join(';');
    }

    _rowToString(r){
        return [
            `${r.Transaction_Code}`,
            `${r.Sub_Transaction}`,
            `'${r.Product_Code}`,
            `${r.RC}`,
            `${r.ProductoOriginal}`,
            `${r.Producto}`,
            `${r.Cuenta_41500}`,
            `${r.Descuentos}`,
            `${r.Emision}`
        ].join(';');
    	//return "" + r.idboleto + ", " + r.nombre;
        //return [r.idboleto, r.nombre].join(';');
    }

    _prepareReportQueries(tableName){
        return [
            `update
    			${tableName}
    		set
    			Product_Code = '0202'
    		where
    			Product_Code = '0201'
    		    and Transaction_Code >= "100000000"
    		    and Transaction_Code like '%00';
    		`,
    		`update
    			${tableName}
    		set
    			Product_Code = '0202'
    		where
    			Product_Code = '0201'
    		    and Transaction_Code between "70000000" and "80000000";
    		`,
    		`update
    			${tableName}
    		set
    			Product_Code = '0602'
    		where
    			Product_Code = '0601'
    		    and Transaction_Code between "70000000" and "80000000";
    		`,
    		`update
    			${tableName}
    		set
    			Product_Code = '1302'
    		where
    			Product_Code = '1300'
    			and Transaction_Code >= "100000000"
    		    and Transaction_Code like '%00';
    		`,
    		`update
    			${tableName}
    		set
    			Product_Code = '0802'
    		where
    			Product_Code = '0801'
    		    and Transaction_Code between "70000000" and "80000000";
    		`,
    		`update
    			${tableName}
    		set
    			Product_Code = '0802'
    		where
    			Product_Code = '0801'
    			and Transaction_Code >= "100000000"
    		    and Transaction_Code like '%00';
    		`
        ];
    }

}

module.exports = DevolutionsReport;
