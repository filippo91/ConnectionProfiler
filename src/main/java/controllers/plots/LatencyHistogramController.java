package controllers.plots;

import java.util.Collection;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import models.BinLatencyDownload;
import models.User;
import services.DownloadService;
import services.PlotsService;
import services.PlotsService.View;

@RestController
@CrossOrigin
public class LatencyHistogramController {
private static final Logger log = LoggerFactory.getLogger(LatencyHistogramController.class);
	
	@Autowired PlotsService plotsService;
	
	@GetMapping("/latencyHistogram/{year}/{month}/{day}/{view}/{bin_width}")
	public Collection<BinLatencyDownload> getBinLatencyDownloads(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view,
			@PathVariable int bin_width,
			@AuthenticationPrincipal User user){
		
		int uuid = user.getUid();
		DateTime d = new DateTime(year, month+1, day, 0, 0);
		return plotsService.getBinLatencyDownloads(uuid, year, month, day, view, bin_width);
	}
}
