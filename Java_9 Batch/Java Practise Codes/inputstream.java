import java.io.*;

class inputstream {

	public static void main(String[] args) throws IOException {
		InputStreamReader isr = new InputStreamReader(System.in);
		BufferedReader br = new BufferedReader(isr);

		int input = Integer.parseInt(br.readLine());
		System.out.println(input);
	

 	}


}
