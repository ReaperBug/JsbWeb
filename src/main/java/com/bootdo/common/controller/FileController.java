package com.bootdo.common.controller;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.bootdo.common.config.BootdoConfig;
import com.bootdo.common.domain.FileDO;
import com.bootdo.common.domain.FilesDO;
import com.bootdo.common.service.FileService;
import com.bootdo.common.service.FilesService;
import com.bootdo.common.utils.FileType;
import com.bootdo.common.utils.FileUtil;
import com.bootdo.common.utils.PageUtils;
import com.bootdo.common.utils.Query;
import com.bootdo.common.utils.R;
import com.bootdo.common.utils.ShiroUtils;

/**
 * 文件上传
 * 
 * @author chglee
 * @email 1992lcg@163.com
 * @date 2017-09-19 16:02:20
 */
@Controller
@RequestMapping("/common/sysFile")
public class FileController extends BaseController {

	@Autowired
	private FileService sysFileService;

	@Autowired
	private BootdoConfig bootdoConfig;

	@GetMapping()
	@RequiresPermissions("common:sysFile:sysFile")
	String sysFile(Model model) {
		Map<String, Object> params = new HashMap<>(16);
		return "common/file/file";
	}

	@ResponseBody
	@GetMapping("/list")
	//@RequiresPermissions("common:sysFile:sysFile")
	public PageUtils list(@RequestParam Map<String, Object> params) {
		// 查询列表数据
		Query query = new Query(params);
		List<FileDO> sysFileList = sysFileService.list(query);
		int total = sysFileService.count(query);
		PageUtils pageUtils = new PageUtils(sysFileList, total);
		return pageUtils;
	}

	@GetMapping("/add")
	// @RequiresPermissions("common:bComments")
	String add() {
		return "common/sysFile/add";
	}

	@GetMapping("/edit")
	// @RequiresPermissions("common:bComments")
	String edit(Long id, Model model) {
		FileDO sysFile = sysFileService.get(id);
		model.addAttribute("sysFile", sysFile);
		return "common/sysFile/edit";
	}

	/**
	 * 信息
	 */
	@RequestMapping("/info/{id}")
	@RequiresPermissions("common:info")
	public R info(@PathVariable("id") Long id) {
		FileDO sysFile = sysFileService.get(id);
		return R.ok().put("sysFile", sysFile);
	}

	/**
	 * 保存
	 */
	@ResponseBody
	@PostMapping("/save")
	@RequiresPermissions("common:save")
	public R save(FileDO sysFile) {
		if (sysFileService.save(sysFile) > 0) {
			return R.ok();
		}
		return R.error();
	}

	/**
	 * 修改
	 */
	@RequestMapping("/update")
	@RequiresPermissions("common:update")
	public R update(@RequestBody FileDO sysFile) {
		sysFileService.update(sysFile);

		return R.ok();
	}

	/**
	 * 删除
	 */
	@PostMapping("/remove")
	@ResponseBody
	// @RequiresPermissions("common:remove")
	public R remove(Long id, HttpServletRequest request) {
		if ("test".equals(getUsername())) {
			return R.error(1, "演示系统不允许修改,完整体验请部署程序");
		}
		String fileName = bootdoConfig.getUploadPath() + sysFileService.get(id).getUrl().replace("/files/", "");
		if (sysFileService.remove(id) > 0) {
			boolean b = FileUtil.deleteFile(fileName);
			if (!b) {
				return R.error("数据库记录删除成功，文件删除失败");
			}
			return R.ok();
		} else {
			return R.error();
		}
	}

	/**
	 * 删除
	 */
	@PostMapping("/batchRemove")
	@ResponseBody
	@RequiresPermissions("common:remove")
	public R remove(@RequestParam("ids[]") Long[] ids) {
		if ("test".equals(getUsername())) {
			return R.error(1, "演示系统不允许修改,完整体验请部署程序");
		}
		sysFileService.batchRemove(ids);
		return R.ok();
	}

	@ResponseBody
	@PostMapping("/sysupload")
	R sysupload(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
		String fileName = file.getOriginalFilename();
		String fileName2 = FileUtil.renameToUUID(fileName);
		FileDO sysFile = new FileDO(FileType.fileType(fileName), "/files/" + fileName2, new Date(),fileName,String.valueOf(ShiroUtils.getUser().getUserId()),ShiroUtils.getUser().getUsername());
		try {
			FileUtil.uploadFile(file.getBytes(), bootdoConfig.getUploadPath(), fileName2);
		} catch (Exception e) {
			return R.error();
		}

		if (sysFileService.save(sysFile) > 0) {
			return R.ok().put("fileName",sysFile.getUrl());
		}
		return R.error();
	}

	@Autowired
	FilesService filesService;
	
	@ResponseBody
	@PostMapping("/upload")
	R upload(@RequestParam("file") MultipartFile file, HttpServletRequest request) {

		

		filesService.save(file);
		
/*		FilesDO filesDODownlode = filesService.get(id);
		byte[] contentDownlode = filesDODownlode.getContent();

		try {
			FileOutputStream fos=new FileOutputStream("C:\\Users\\Public\\Downloads\\"+fileName);
			fos.write(contentDownlode,0,contentDownlode.length);
			InputStream in = null;
	        int size = 0;
	        if (contentDownlode.length > 0) {
	            fos.write(contentDownlode, 0, contentDownlode.length);
	        } else {
	            while ((size = in.read(contentDownlode)) != -1) {
	                fos.write(contentDownlode, 0, size);
	            }
	            in.close();
	        }
	        fos.close();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}*/

			return R.ok();

	}
	
	@RequestMapping("/downloadFile/{fileId}")
	public void downloadFile(HttpServletRequest request, HttpServletResponse response,
			@PathVariable("fileId") String fileId) throws IOException {
		//String[] fileId = new String[] { fileId };
		FilesDO fileDO = filesService.get(fileId);
		if(fileDO!=null){
			/*byte[] data = fileDO.getContent();
			response.reset();
			//response.setHeader("Content-Disposition", "attachment; filename=\"bootdo.zip\"");
			//response.setHeader("Content-Disposition", "attachment; filename=\"" + fileDO.getFileMc().getBytes("UTF-8"),"iso8859-1" +"\"");
			response.setHeader("Content-disposition","attachment;filename="+new String(fileDO.getFileMc().getBytes("UTF-8"),"iso8859-1"));
			response.addHeader("Content-Length", "" + data.length);
			response.setContentType("application/octet-stream; charset=UTF-8");

			IOUtils.write(data, response.getOutputStream());*/
			response.sendRedirect(fileDO.getUrl());
		}
	}
		/*@RequestMapping("/downloadFile/{fileId}")
		public ResponseEntity<byte[]> downloadFile(HttpServletRequest request, HttpServletResponse response,
				@PathVariable("fileId") String fileId) throws IOException {
			FilesDO fileDO = filesService.get(fileId);
			if(fileDO!=null){
				String fileurl = bootdoConfig.getUploadPath() +fileDO.getUrl().replace("/files/", "");
				File file=new File(fileurl);
				HttpHeaders headers=new HttpHeaders();
				String filename=new String(fileDO.getFileMc().getBytes("UTF-8"),"iso-8859-1");
				headers.setContentDispositionFormData("attachment", filename);
				headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
				return new ResponseEntity<byte[]>(FileUtils.readFileToByteArray(file),headers,HttpStatus.CREATED);
			}
			return null;
	}*/
}
