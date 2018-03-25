const Report = require('../report').Report;

class SeatForTransactionIdReport extends Report {

    constructor(connectionPool){
    	super(connectionPool);
    }

    _tableDefinition(){
        return `(
            Transaction_Code varchar(256),
            Importe varchar(255)
        )`;
    }

    _reportQuery(tmpTable){
        return `
        select
			t.Transaction_Code,
			(IFNULL(rc1.Codigo,rc2.Codigo)) as OPERATIVE_CENTER,
			(IFNULL(prod1.Codigo,prod2.Codigo)) as PRODUCT,
			(IFNULL(chan1.Codigo,chan2.Codigo)) as CHANNEL,
			(IFNULL(cli1.Codigo,cli2.Codigo)) as CLIENT_TYPE,
			(IFNULL(via1.Codigo,via2.Codigo)) as DEAL,
			t.Importe
		from
        	${tmpTable} t
        	left join wiki_resumida_para_asientos w1 on (t.Transaction_Code = w1.transaction_code_producto)
			left join wiki_resumida_para_asientos w2 on (t.Transaction_Code = w2.TRANSACTION_CODE)
			left join para_armar_asiento rc1 on (rc1.Tipo = 'Pais' and rc1.Nombre = w1.Pais)
			left join para_armar_asiento rc2 on (rc2.Tipo = 'Pais' and rc2.Nombre = w2.Pais)
			left join para_armar_asiento prod1 on (prod1.Tipo = 'Producto' and prod1.Nombre = w1.ProductoOriginal and prod1.Nombre2 = w1.Producto)
			left join para_armar_asiento prod2 on (prod2.Tipo = 'Producto' and prod2.Nombre = w2.ProductoOriginal and prod2.Nombre2 = w2.Producto)
			left join para_armar_asiento chan1 on (chan1.Tipo = 'Channel' and chan1.Nombre = w1.Plataforma)
			left join para_armar_asiento chan2 on (chan2.Tipo = 'Channel' and chan2.Nombre = w2.Plataforma)
			left join para_armar_asiento cli1 on (cli1.Tipo = 'Tipo_Cliente' and cli1.Nombre = w1.Tipo_Cliente)
			left join para_armar_asiento cli2 on (cli2.Tipo = 'Tipo_Cliente' and cli2.Nombre = w2.Tipo_Cliente)
			left join para_armar_asiento cob1 on (cob1.Tipo = 'Tipo_de_Cobro' and cob1.Nombre = w1.TipoDePago)
			left join para_armar_asiento cob2 on (cob2.Tipo = 'Tipo_de_Cobro' and cob2.Nombre = w2.TipoDePago)
			left join para_armar_asiento via1 on (via1.Tipo = 'Negocio' and via1.Nombre = w1.Viaje)
			left join para_armar_asiento via2 on (via2.Tipo = 'Negocio' and via2.Nombre = w2.Viaje)
		where 
			not exists (select 1 from wiki_resumida_para_asientos w22 
							where t.Transaction_Code = w22.TRANSACTION_CODE
								and w22.id > w2.id)
			and not exists (select 1 from wiki_resumida_para_asientos w12 
							where t.Transaction_Code = w12.transaction_code_producto
								and w12.id > w1.id)
;
        `;
    }

    _reportHeader(){
        return [
            `Transaction_Code`,
            `ENTIDAD_LEGAL`,
            `PRODUCTO`,
            `CANAL`,
            `CLIENTE`,
            `NEGOCIO`,
			`IMPORTE`
        ].join(';');
    }

    _rowToString(r){
        return [
            `${r.Transaction_Code}`,
			`${r.OPERATIVE_CENTER}`,
            `'${r.PRODUCT}`,
            `'${r.CHANNEL}`,
            `'${r.CLIENT_TYPE}`,
            `'${r.DEAL}`,
            `${r.Importe}`
        ].join(';');
    	//return "" + r.idboleto + ", " + r.nombre;
        //return [r.idboleto, r.nombre].join(';');
    }


}

module.exports = SeatForTransactionIdReport;
