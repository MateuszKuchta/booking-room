package pl.itutil.ecu.util;

import java.math.BigDecimal;

public class SalesData {

	private BigDecimal planSale;
	private BigDecimal actualSale;
	private String name;

	public BigDecimal getPlanSale() {
		return planSale;
	}

	public void setPlanSale(BigDecimal planSale) {
		this.planSale = planSale;
	}

	public BigDecimal getActualSale() {
		return actualSale;
	}

	public void setActualSale(BigDecimal actualSale) {
		this.actualSale = actualSale;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

}
