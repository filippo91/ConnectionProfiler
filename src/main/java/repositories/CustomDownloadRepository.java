package repositories;

import java.util.Collection;

import org.joda.time.DateTime;
import org.springframework.data.repository.NoRepositoryBean;

import models.AvgDaySpeedDownload;
import models.BinLatencyDownload;
import models.BinSpeedDownload;
import models.FrequencyAccess;
import models.SizeDownload;

@NoRepositoryBean
public interface CustomDownloadRepository {
	Collection<BinLatencyDownload> getLatencyBins(int bin_width, DateTime start, DateTime end);
	
	/**
	 * 
	 * @param uuid user unique identifier
	 * @param start
	 * @param end
	 * @return day average download speed grouped by ISP, for all days in the given time span.
	 */
	Collection<AvgDaySpeedDownload> getAvgDayDownloadsSpeed(int uuid, DateTime start, DateTime end);
	/**
	 * 
	 * @param bin_width bin width in bits (e.g. bin_width = 1000 to get bins of 1 kbps)
	 * @param uuid user unique identifier
	 * @param start
	 * @param end
	 * @return bin size differentiated by ISP, considering the provided time span
	 */
	Collection<BinSpeedDownload> getDownloadsSpeedBins(int bin_width, int uuid, DateTime start, DateTime end);
	
	/**
	 * 
	 * @param bin_width bin width in milliseconds
	 * @param uuid user unique identifier
	 * @param start
	 * @param end
	 * @return bin size differentiated by ISP, considering the provided time span
	 */
	Collection<BinLatencyDownload> getLatencyBins(int bin_width, int uuid, DateTime start, DateTime end);
	
	/**
	 * 
	 * @param uuid user unique identifier
	 * @param start
	 * @param end
	 * @return number of visits for each domain in the given time span 
	 */
	Collection<FrequencyAccess> getFrequencyAccessesByDomain(int uuid, DateTime start, DateTime end);
	
	/**
	 * 
	 * @param uuid user unique identifier
	 * @param start
	 * @param end
	 * @return downloads' size for each domain in the given time span
	 */
	Collection<SizeDownload> getSizeDownloadsByDomain(int uuid, DateTime start, DateTime end);
	Collection<AvgDaySpeedDownload> getAvgDayDownloadsSpeed(DateTime start, DateTime end);

	Collection<BinSpeedDownload> getDownloadsSpeedBins(int bin_width, DateTime start, DateTime end);
}
