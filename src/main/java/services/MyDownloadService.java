package services;

import java.util.Collection;

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
		DateTime inputDate, start, end;

		inputDate = new DateTime(year, month, day, 0, 0);
		start = end = null;
		switch(view){
		case week:
			start = inputDate.withDayOfWeek(1);
			end = start.plusWeeks(1);
			break;
		case month:
			start = inputDate.withDayOfMonth(1);
			end = start.plusMonths(1);
			break;
		case months:
			start = inputDate.withDayOfMonth(1);
			end = start.plusMonths(NUMBER_OF_MONTH_IN_MULTI_MONTHS_VIEW);
			break;
		}
		
		return downloadRepository.getAvgDayDownloadsSpeed(uuid, start.toDate(), end.toDate());
	}

	@Override
	public Collection<BinSpeedDownload> getBinSpeedDownloads(int uuid, int year, int month, int day, View view) {
		DateTime inputDate, start, end;

		inputDate = new DateTime(year, month, day, 0, 0);
		start = end = null;
		switch(view){
		case week:
			start = inputDate.withDayOfWeek(1);
			end = start.plusWeeks(1);
			break;
		case month:
			start = inputDate.withDayOfMonth(1);
			end = start.plusMonths(1);
			break;
		case months:
			start = inputDate.withDayOfMonth(1);
			end = start.plusMonths(NUMBER_OF_MONTH_IN_MULTI_MONTHS_VIEW);
			break;
		}
		
		return downloadRepository.getDownloadsSpeedBins(SPEED_BIN_WIDTH, uuid, start, end);
	}
	
	@Override
	public Collection<BinLatencyDownload> getBinLatencyDownloads(int uuid, int year, int month, int day, View view) {
		DateTime inputDate, start, end;

		inputDate = new DateTime(year, month, day, 0, 0);
		start = end = null;
		switch(view){
		case week:
			start = inputDate.withDayOfWeek(1);
			end = start.plusWeeks(1);
			break;
		case month:
			start = inputDate.withDayOfMonth(1);
			end = start.plusMonths(1);
			break;
		case months:
			start = inputDate.withDayOfMonth(1);
			end = start.plusMonths(NUMBER_OF_MONTH_IN_MULTI_MONTHS_VIEW);
			break;
		}
		
		return downloadRepository.getLatencyBins(LATENCY_BIN_WIDTH, uuid, start, end);
	}

	@Override
	public Collection<FrequencyAccess> getDomainFrequencyAccess(int uuid, int year, int month, int day, View view) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Collection<SizeDownload> getDomainSizeDownload(int uuid, int year, int month, int day, View view) {
		// TODO Auto-generated method stub
		return null;
	}
	/*
	DateTime getStartDate(int year, int month, int day, View view){
		switch(view){
		case WEEK:
			start = inputDate.withDayOfWeek(1);
			end = start.plusWeeks(1);
			break;
		case MONTH:
			start = inputDate.withDayOfMonth(1);
			end = start.plusMonths(1);
			break;
		case MULTI_MONTHS:
			start = inputDate.withDayOfMonth(1);
			end = start.plusMonths(NUMBER_OF_MONTH_IN_MULTI_MONTHS_VIEW);
			break;
		}
		return null;
	}
	*/

	@Override
	public Collection<AvgDaySpeedDownload> getAvgDayDownloadsSpeed(int year, int month, int day, View view) {
		DateTime inputDate, start, end;

		inputDate = new DateTime(year, month, day, 0, 0);
		start = end = null;
		switch(view){
		case week:
			start = inputDate.withDayOfWeek(1);
			end = start.plusWeeks(1);
			break;
		case month:
			start = inputDate.withDayOfMonth(1);
			end = start.plusMonths(1);
			break;
		case months:
			start = inputDate.withDayOfMonth(1);
			end = start.plusMonths(NUMBER_OF_MONTH_IN_MULTI_MONTHS_VIEW);
			break;
		}
		
		return downloadRepository.getAvgDayDownloadsSpeed(start.toDate(), end.toDate());
	}
}
