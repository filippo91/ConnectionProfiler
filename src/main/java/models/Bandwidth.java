package models;

public class Bandwidth {
	private Integer average;
	private Integer minimum;
	private Integer maximum;
	private Integer samples;
	
	public Bandwidth() {
		this.average = 0;
		this.minimum = 0; 
		this.maximum = 0;
		this.samples = 0;
	}
	
	public Integer getAverage() {
		return average;
	}
	public void setAverage(Integer average) {
		this.average = average;
	}
	public Integer getMinimum() {
		return minimum;
	}
	public void setMinimum(Integer minimum) {
		this.minimum = minimum;
	}
	public Integer getMaximum() {
		return maximum;
	}
	public void setMaximum(Integer maximum) {
		this.maximum = maximum;
	}
	public Integer getSamples() {
		return samples;
	}
	public void setSamples(Integer samples) {
		this.samples = samples;
	}
	
	
}
