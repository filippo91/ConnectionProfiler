package models;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;

/**
 * Class representing the information related to the client 
 * download metrics gathered by the user proxy.
 * 
 * @author phil
 *
 */
@Document(collection="DOWNLOADS")
public class Download {

	@Id
	private String id;
	
	private Integer uuid;
	private String client_address;
	private Integer asnum;
	private String asname;
	private String server_address;
	private String server_domain;
	private String url;
	private Long size;
	private Long duration;
	private Long download_speed;
	private Integer connect_time;
	private String resource_type;
	
	@DateTimeFormat(iso=ISO.DATE_TIME)
	private Date timestamp; //#milliseconds since 1/1/1970 = Unix epoch
	
	public Download(){}

	/**
	 * 
	 * @return unique id
	 */
	public String getId() {
		return id;
	}

	/**
	 * 
	 * @param id unique id
	 */
	public void setId(String id) {
		this.id = id;
	}

	/**
	 * 
	 * @return user unique identifier
	 */
	public Integer getUuid() {
		return uuid;
	}

	/**
	 * 
	 * @param uuid user unique identifier
	 */
	public void setUuid(Integer uuid) {
		this.uuid = uuid;
	}

	/**
	 * 
	 * @return client public ipv4 address
	 */
	public String getClient_address() {
		return client_address;
	}

	/**
	 * 
	 * @param client_address client public ipv4 address
	 */
	public void setClient_address(String client_address) {
		this.client_address = client_address;
	}

	/**
	 * 
	 * @return autonomous system code related with the client's 
	 * Internet Service Provider
	 */
	public Integer getAsnum() {
		return asnum;
	}

	/**
	 * 
	 * @param asnum autonomous system code related with the client's 
	 * Internet Service Provider
	 */
	public void setAsnum(Integer asnum) {
		this.asnum = asnum;
	}

	/**
	 * 
	 * @return public ipv4 address of the contacted server 
	 */
	public String getServer_address() {
		return server_address;
	}
	
	/**
	 * 
	 * @param server_address public ipv4 address of the contacted server 
	 */
	public void setServer_address(String server_address) {
		this.server_address = server_address;
	}

	/**
	 * 
	 * @return server domain name, 2nd level (e.g. google.com)
	 */
	public String getServer_domain() {
		return server_domain;
	}

	/**
	 * 
	 * @param server_domain server domain name, 2nd level (e.g. google.com)
	 */
	public void setServer_domain(String server_domain) {
		this.server_domain = server_domain;
	}

	/**
	 * 
	 * @return requested resource URL
	 */
	public String getUrl() {
		return url;
	}

	/**
	 * 
	 * @param url requested resource URL
	 */
	public void setUrl(String url) {
		this.url = url;
	}

	/**
	 * 
	 * @return resource size in byte
	 */
	public Long getSize() {
		return size;
	}

	/**
	 * 
	 * @param size resource size in byte
	 */
	public void setSize(Long size) {
		this.size = size;
	}

	/**
	 * 
	 * @return time elapsed, in milliseconds, between the first and the last byte 
	 * of the HTTP response were received
	 */
	public Long getDuration() {
		return duration;
	}

	/**
	 * 
	 * @param duration time elapsed, in milliseconds, between the first and the last byte 
	 * of the HTTP response were received
	 */
	public void setDuration(Long duration) {
		this.duration = duration;
	}

	/**
	 * 
	 * @return download speed in bps
	 */
	public Long getDownload_speed() {
		return download_speed;
	}

	/**
	 * 
	 * @param download_speed {@link Download#getDownload_speed()}
	 */
	public void setDownload_speed(Long download_speed) {
		this.download_speed = download_speed;
	}

	/**
	 * 
	 * @return time elapsed, in milliseconds, between the HTTP request was
	 * sent and the first byte of the response was received 
	 */
	public Integer getConnect_time() {
		return connect_time;
	}

	/**
	 * 
	 * @param download_speed {@link Download#getConnect_time()}
	 */
	public void setConnect_time(Integer connect_time) {
		this.connect_time = connect_time;
	}

	/**
	 * 
	 * @return resource content-type
	 */
	public String getResource_type() {
		return resource_type;
	}

	/**
	 * 
	 * @param resource_type {@link Download#getResource_type()}
	 */
	public void setResource_type(String resource_type) {
		this.resource_type = resource_type;
	}

	/**
	 * 
	 * @return instant when the HTTP request was issued (unix time)
	 */
	public Date getTimestamp() {
		return timestamp;
	}

	/**
	 * 
	 * @param resource_type {@link Download#getTimestamp()}
	 */
	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	
	
	public String getAsname() {
		return asname;
	}

	public void setAsname(String asname) {
		this.asname = asname;
	}

	@Override
	public String toString() {
		return "Download [id=" + id + ", uuid=" + uuid + ", client_address=" + client_address + ", asnum=" + asnum
				+ ", server_address=" + server_address + ", server_domain=" + server_domain + ", url=" + url + ", size="
				+ size + ", duration=" + duration + ", download_speed=" + download_speed + ", connectTime="
				+ connect_time + ", resource_type=" + resource_type + ", timestamp=" + timestamp + "]";
	}
	
	
}
