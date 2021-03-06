package services;

import java.util.Collection;

import org.springframework.security.access.prepost.PreAuthorize;

import models.AvgDaySpeedDownload;
import models.BinLatencyDownload;
import models.BinSpeedDownload;
import models.FrequencyAccess;
import models.SizeDownload;
import models.TableDownload;

public interface PlotsService {
	public static final int NUMBER_OF_MONTH_IN_MULTI_MONTHS_VIEW = 3;
	public static final int SPEED_BIN_WIDTH = 1000; //bps
	public static final int LATENCY_BIN_WIDTH = 1000; //milliseconds
	
	public static enum View{
		week,
		month,
		months
	}
	
	/**
	 * Get a list of download records ordered by timestamp. 
	 * The size of that list is set by pageSize method parameter.
	 * 
	 * @param uuid
	 * @param page
	 * @param pageSize
	 * @return
	 */
	@PreAuthorize("isAuthenticated()")
	public TableDownload getDownloadsSpeed(int uuid, int page, int pageSize);
	
	/**
	 * Compute the average download speed for each day between the starting and ending 
	 * dates provided as input parameters. (Graph1: Time line graph)
	 * 
	 * @param uuid
	 * @param start
	 * @param end
	 * @return
	 */
	@PreAuthorize("isAuthenticated()")
	public Collection<AvgDaySpeedDownload> getAvgDayDownloadsSpeed(int uuid, int year, int month, int day, View view);
	
	@PreAuthorize("permitAll()")
	public Collection<AvgDaySpeedDownload> getAvgDayDownloadsSpeed(int year, int month, int day, View view);
	
	@PreAuthorize("isAuthenticated()")
	public Collection<BinLatencyDownload> getBinLatencyDownloads(int uuid, int year, int month, int day, View view, int bin_width);
	
	@PreAuthorize("isAuthenticated()")
	public Collection<BinSpeedDownload> getBinSpeedDownloads(int year, int month, int day, View view, int speedBinWidth);
	
	@PreAuthorize("permitAll()")
	public Collection<BinSpeedDownload> getBinSpeedDownloads(int uuid, int year, int month, int day, View view, int speedBinWidth);
	
	@PreAuthorize("isAuthenticated()")
	public Collection<FrequencyAccess> getDomainFrequencyAccess(int uuid, int year, int month, int day, View view);
	
	@PreAuthorize("isAuthenticated()")
	public Collection<SizeDownload> getDomainSizeDownload(int uuid, int year, int month, int day, View view);
	
}
