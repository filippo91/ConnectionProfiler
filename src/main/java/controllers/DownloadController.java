package controllers;


import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import models.AvgDaySpeedDownload;
import models.BinLatencyDownload;
import models.BinSpeedDownload;
import models.Download;
import models.FrequencyAccess;
import models.SizeDownload;
import services.DownloadService;
import services.DownloadService.View;

@CrossOrigin
@RestController
public class DownloadController {
	@Autowired private DownloadService downloadService;
	
	@RequestMapping("/greeting")
	public Download greeting(){
		System.out.println("hello");
		return new Download();
	}
	
	
	@RequestMapping("/speedGraph/{year}/{month}/{day}/{view}")
	public Collection<AvgDaySpeedDownload> getDownloadsSpeed(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		//get uuid from spring security
		int uuid = 0;
		
		return downloadService.getAvgDayDownloadsSpeed(uuid, year, month, day, view);
	}
	
	@RequestMapping("/speedGraphPublic/{year}/{month}/{day}/{view}")
	public Collection<AvgDaySpeedDownload> getDownloadsSpeedPublic(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		//get uuid from spring security
		
		return downloadService.getAvgDayDownloadsSpeed(year, month, day, view);
	}
	
	@RequestMapping("/speedTable/{page}/{size}")
	public Collection<Download> getDownloadsSpeedByWeek(
			@PathVariable int page, 
			@PathVariable int size){
		//get uuid from spring security
		int uuid = 0;
		
		return downloadService.getDownloadsSpeed(uuid, page, size);
	}
	
	@RequestMapping("/speedHistogram/{year}/{month}/{day}/{view}")
	public Collection<BinSpeedDownload> getBinSpeedDownloads(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		int uuid = 0;
		
		return downloadService.getBinSpeedDownloads(uuid, year, month, day, view);
	}
	
	@RequestMapping("/latencyHistogram/{year}/{month}/{day}/{view}")
	public Collection<BinLatencyDownload> getBinLatencyDownloads(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		int uuid = 0;
		
		return downloadService.getBinLatencyDownloads(uuid, year, month, day, view);
	}
	
	@RequestMapping("/pieAccesses/{year}/{month}/{day}/{view}")
	public Collection<FrequencyAccess> getDomainFrequencyAccess(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		int uuid = 0;
		
		return downloadService.getDomainFrequencyAccess(uuid, year, month, day, view);
	}
	
	@RequestMapping("/pieSize/{year}/{month}/{day}/{view}")
	public Collection<SizeDownload> getDomainSizeDownload(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		int uuid = 0;
		
		return downloadService.getDomainSizeDownload(uuid, year, month, day, view);
	}
}
