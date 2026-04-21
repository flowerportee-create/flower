# encoding: utf-8
require 'base64'

html = File.read('keifu_demo.html', encoding: 'utf-8')

images = {
  'img/tree_full.jpg'  => 'image/jpeg',
  'img/cover.png'      => 'image/png',
  'img/history.png'    => 'image/png',
  'img/diagnosis.png'  => 'image/png',
  'img/pilgrimage.png' => 'image/png',
}

images.each do |src, mime|
  data = File.binread(src)
  b64  = Base64.strict_encode64(data)
  html = html.gsub("src=\"#{src}\"", "src=\"data:#{mime};base64,#{b64}\"")
  puts "done: #{src} (#{data.size/1024}KB)"
end

File.write('index.html', html, encoding: 'utf-8')
puts 'complete!'
