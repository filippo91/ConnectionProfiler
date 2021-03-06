package services;

import java.util.Collection;

import org.jboss.logging.Logger;
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
import models.TableDownload;
import repositories.DownloadRepository;

@Service
public class PlotsServiceImpl implements PlotsService{
	Logger log = Logger.getLogger(PlotsServiceImpl.class);
	
	@Autowired DownloadRepository downloadRepository;
	
	@Override
	public TableDownload getDownloadsSpeed(int uuid, int page, int pageSize) {
		Page<Download> resultPage = downloadRepository.findAllByUuidOrderByTimestampDesc(uuid, new PageRequest(page, pageSize));
		Collection<Download> downloads = resultPage.getContent();
		TableDownload tableDownloads = new TableDownload();
		tableDownloads.setDownload(downloads);
		tableDownloads.setTotalElements(resultPage.getTotalElements());
		return tableDownloads;
	}

	
	@Override
	public Collection<AvgDaySpeedDownload> getAvgDayDownloadsSpeed(int uuid, int year, int month, int day, View view) {
		DateTime start, end;
		
		start = getStartDate(year, month, day, view);
		end = getEndDate(year, month, day, view);
		
		return downloadRepository.getAvgDayDownloadsSpeed(uuid, start, end);
	}
	
	@Override
	public Collection<BinSpeedDownload> getBinSpeedDownloads(int uuid, int year, int month, int day, View view, int speedBinWidth) {
		DateTime start, end;
		
		start = getStartDate(year, month, day, view);
		end = getEndDate(year, month, day, view);
		
		return downloadRepository.getDownloadsSpeedBins(speedBinWidth, uuid, start, end);
	}
	
	@Override
	public Collection<BinSpeedDownload> getBinSpeedDownloads(int year, int month, int day, View view, int speedBinWidth) {
		DateTime start, end;
		
		start = getStartDate(year, month, day, view);
		end = getEndDate(year, month, day, view);
		
		return downloadRepository.getDownloadsSpeedBins(speedBinWidth, start, end);
	}
	
	@Override
	public Collection<BinLatencyDownload> getBinLatencyDownloads(int uuid, int year, int month, int day, View view, int bin_width) {
		DateTime start, end;
		
		start = getStartDate(year, month, day, view);
		end = getEndDate(year, month, day, view);
		
		return downloadRepository.getLatencyBins(bin_width, uuid, start, end);
	}


	@Override
	public Collection<FrequencyAccess> getDomainFrequencyAccess(int uuid, int year, int month, int day, View view) {
		DateTime start, end;
		
		start = getStartDate(year, month, day, view);
		end = getEndDate(year, month, day, view);
		
		log.info("Time span: " + uuid + " " + start + " - " + end);
		
		return downloadRepository.getFrequencyAccessesByDomain(uuid, start, end);
	}


	@Override
	public Collection<SizeDownload> getDomainSizeDownload(int uuid, int year, int month, int day, View view) {
		DateTime start, end;
		
		start = getStartDate(year, month, day, view);
		end = getEndDate(year, month, day, view);
				
		log.info("Time span: " + uuid + " " + start + " - " + end);	
		
		return downloadRepository.getSizeDownloadsByDomain(uuid, start, end);
	}


	@Override
	public Collection<AvgDaySpeedDownload> getAvgDayDownloadsSpeed(int year, int month, int day, View view) {
		DateTime start, end;
		
		start = getStartDate(year, month, day, view);
		end = getEndDate(year, month, day, view);
		
		log.info("Time span: " + start + " - " + end);
		
		return downloadRepository.getAvgDayDownloadsSpeed(start, end);
	}



	
	public DateTime getEndDate(int year, int month, int day, View view) {
		DateTime date;
		date = new DateTime(year, month+1, day, 0, 0);
		
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
		
		return date;
	}

	public DateTime getStartDate(int year, int month, int day, View view) {
		DateTime date;
		date = new DateTime(year, month+1, day, 0, 0);
		
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
		
		return date;
	}	
}
