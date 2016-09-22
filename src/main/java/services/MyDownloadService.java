package services;

import java.util.Collection;
import java.util.Date;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import models.AvgDaySpeedDownload;
import models.BinLatencyDownload;
import models.BinSpeedDownload;
import models.Download;
import models.FrequencyAccess;
import models.SizeDownload;
import repositories.DownloadRepository;

@Service
public class MyDownloadService implements DownloadService {
	
	@Autowired
	private DownloadRepository downloadRepository;
	
	@Override
	public Collection<Download> getDownloadsSpeed(int uuid, int page, int pageSize) {
		Page<Download> resultPage = downloadRepository.findAllByUuidOrderByTimestampDesc(uuid, new PageRequest(page, pageSize));
		Collection<Download> downloads = resultPage.getContent();
		return downloads;
	}

	@Override
	public Collection<AvgDaySpeedDownload> getAvgDayDownloadsSpeed(int uuid, int year, int month, int day, View view) {
		Date start, end;
		
		start = getStartDate(year, month, day, view);
		end = getEndDate(year, month, day, view);
		
		return downloadRepository.getAvgDayDownloadsSpeed(uuid, start, end);
	}

	@Override
	public Collection<BinSpeedDownload> getBinSpeedDownloads(int uuid, int year, int month, int day, View view) {
		Date start, end;
		
		start = getStartDate(year, month, day, view);
		end = getEndDate(year, month, day, view);
		
		return downloadRepository.getDownloadsSpeedBins(SPEED_BIN_WIDTH, uuid, start, end);
	}
	
	@Override
	public Collection<BinLatencyDownload> getBinLatencyDownloads(int uuid, int year, int month, int day, View view, int bin_width) {
		Date start, end;
		
		start = getStartDate(year, month, day, view);
		end = getEndDate(year, month, day, view);
		
		return downloadRepository.getLatencyBins(bin_width, uuid, start, end);
	}

	@Override
	public Collection<FrequencyAccess> getDomainFrequencyAccess(int uuid, int year, int month, int day, View view) {
		Date start, end;
		
		start = getStartDate(year, month, day, view);
		end = getEndDate(year, month, day, view);
		
		return downloadRepository.getFrequencyAccessesByDomain(uuid, start, end);
	}

	@Override
	public Collection<SizeDownload> getDomainSizeDownload(int uuid, int year, int month, int day, View view) {
		Date start, end;
		
		start = getStartDate(year, month, day, view);
		end = getEndDate(year, month, day, view);
		
		return downloadRepository.getSizeDownloadsByDomain(uuid, start, end);
	}

	@Override
	public Collection<AvgDaySpeedDownload> getAvgDayDownloadsSpeed(int year, int month, int day, View view) {
		Date start, end;
		
		start = getStartDate(year, month, day, view);
		end = getEndDate(year, month, day, view);
		
		return downloadRepository.getAvgDayDownloadsSpeed(start, end);
	}

	@Override
	public Download saveDownload(Download download) {
		return downloadRepository.save(download);
	}
	
	private Date getStartDate(int year, int month, int day, View view) {
		DateTime date;
		date = new DateTime(year, month, day, 0, 0);
		
		switch(view){
		case week:
			date = date.withDayOfWeek(1);
			break;
		case month:
			date = date.withDayOfMonth(1);
			break;
		case months:
			date = date.withDayOfMonth(1);
			break;
		}
		
		return date.toDate();
	}

	private Date getEndDate(int year, int month, int day, View view) {
		DateTime date;
		date = new DateTime(year, month, day, 0, 0);
		
		switch(view){
		case week:
			date = date.withDayOfWeek(1).plusWeeks(1);
			break;
		case month:
			date = date.withDayOfMonth(1).plusMonths(1);
			break;
		case months:
			date = date.withDayOfMonth(1).plusMonths(NUMBER_OF_MONTH_IN_MULTI_MONTHS_VIEW);
			break;
		}
		
		return date.toDate();
	}
	
}
