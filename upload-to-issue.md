# 通过GitHub Issue上传图片并获取永久链接

这是解决图片显示问题的最可靠方法。

## 步骤

1. 前往您的GitHub仓库: https://github.com/SolDrip-S/SolDrip

2. 点击顶部菜单的 **Issues** 选项卡

3. 点击绿色的 **New issue** 按钮

4. 在标题栏中输入: "Image Assets for README"

5. 在描述框中，直接拖放或粘贴您的图片:
   - 拖放您的Logo图片
   - 拖放您的Banner图片
   - 拖放您的Flow图片(如果需要)

6. GitHub会自动上传图片并生成链接，如:
   ```
   ![image](https://user-images.githubusercontent.com/12345678/123456789-abcdef-1234-5678-abcdef123456.png)
   ```

7. 复制每个图片链接中的URL部分(https://user-images...)

8. 点击 **Submit new issue** 提交Issue

9. 然后编辑README.md文件，使用这些图片链接:
   ```md
   <p align="center">
     <img src="你的Logo图片URL" alt="SolDrip Logo" width="200"/>
   </p>
   
   ...
   
   <p align="center">
     <img src="你的Banner图片URL" alt="SolDrip Banner" width="100%"/>
   </p>
   ```

10. 提交更改:
    ```bash
    git add README.md
    git commit -m "Update README with GitHub Issue image links"
    git push origin main
    ```

这种方法的优点是GitHub Issue中的图片会被永久存储在GitHub的服务器上，不会有图床过期或不可访问的问题。 